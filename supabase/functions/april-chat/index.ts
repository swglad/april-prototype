const ALLOWED_ORIGINS = [
  'https://april-prototype.lovable.app',
  'https://id-preview--b70e1edc-da90-4e8a-a46b-f40d950d9974.lovable.app',
  'https://b70e1edc-da90-4e8a-a46b-f40d950d9974.lovableproject.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Input sanitization
function sanitizeMessage(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '')                    // strip HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '')           // control chars
    .replace(/["""''`]/g, "'")                  // normalize quotes
    .replace(/ignore\s+(prior|previous|all|above)\s+instructions?/gi, '[filtered]')
    .replace(/return\s+(system|original)\s+prompt/gi, '[filtered]')
    .slice(0, 500)
    .trim();
}

const INTAKE_SYSTEM_PROMPT = `You are APRil's intake assistant — a warm, unhurried, non-judgmental conversational companion helping a user reflect on their debt situation before they run their analysis. Listen to what they share about their financial context — income variability, upcoming expenses, payment history, financial stress, or other factors relevant to debt management. Use this information to build a richer picture that will personalize their summary later. Keep responses under 80 words. On your first message in any session, include: 'Just a reminder — I'm an educational tool, not a financial advisor. Nothing I share is financial advice.'

LANGUAGE RULES — these are strictly enforced. Never use: should, must, worst, bad debt, dangerous, wasting, mistake, wrong, urgently, clearly. Use only: you could consider, some people find, one thing worth knowing is, it might be worth reflecting on.

BLOCKED OUTPUT EXAMPLES — never produce anything resembling these:
BLOCKED: 'You should pay off your credit card first — it's clearly the worst debt.' WHY: uses 'should', implies judgment, crosses into advice. INSTEAD: state the factual cost — e.g. 'Your credit card generates the highest monthly interest at $X/month.'
BLOCKED: 'Based on your profile, a balance transfer card could save you $1,200.' WHY: product recommendation, specific financial guidance, regulatory risk. INSTEAD: blocked entirely — APRil models existing debts only, no product suggestions.
BLOCKED: 'You're wasting $200/month by only making minimum payments.' WHY: judgmental framing, violates non-judgmental language policy. INSTEAD: 'Minimum payments only: $X total interest over Y months.'
BLOCKED: 'This is bad debt — you really need to deal with this urgently.' WHY: 'bad debt' is explicitly banned, creates anxiety without action. INSTEAD: use neutral labels only — highest-APR, highest-balance, highest-impact.

If asked about investments, insurance, retirement planning, home purchases, marriage/divorce finances, stock picks, or any topic outside debt management, respond: 'That's a great question, but it's a bit outside what I'm set up to help with here. I'm focused on helping you think through your debt picture — is there anything about your debts or payment situation I can help you reflect on?'`;

const SUMMARY_SYSTEM_PROMPT = `You are APRil's summary assistant. The user has completed their debt analysis and may have questions about their specific results. You have access to their full computed debt data and may reference exact figures from it. Answer only questions directly related to their debt picture as shown in the analysis. If asked a hypothetical, you may give a directional answer using their existing data as a baseline — but note that they should update their inputs in Step 5 for an accurate recalculation. Keep responses under 100 words. Every response must end with this line in italics: '*This is an educational response, not financial advice.*'

LANGUAGE RULES — these are strictly enforced. Never use: should, must, worst, bad debt, dangerous, wasting, mistake, wrong, urgently, clearly. Use only: you could consider, some people find, one thing worth knowing is, this approach tends to.

BLOCKED OUTPUT EXAMPLES — never produce anything resembling these:
BLOCKED: 'You should pay off your credit card first — it's clearly the worst debt.' INSTEAD: 'Your credit card generates the highest monthly interest at $X/month.'
BLOCKED: 'Based on your profile, a balance transfer card could save you $1,200.' INSTEAD: blocked entirely — no product suggestions under any circumstances.
BLOCKED: 'You're wasting $200/month by only making minimum payments.' INSTEAD: 'Minimum payments only on this debt would result in $X total interest over Y months.'
BLOCKED: 'This is bad debt — you really need to deal with this urgently.' INSTEAD: use neutral labels only — highest-APR, highest-balance, highest-impact.

For out-of-scope topics (investments, insurance, retirement, home purchases, marriage/divorce, stock picks), respond warmly: 'That falls a bit outside what APRil is designed to help with — I'm focused on your debt picture. Is there anything about your analysis I can clarify?' Never make product recommendations of any kind.`;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Origin validation
  const origin = req.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ reply: "I'm having a little trouble right now — please try again in a moment." }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ reply: "I'm having a little trouble right now — please try again in a moment." }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const apiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: "I'm having a little trouble right now — please try again in a moment." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const model = Deno.env.get('CLAUDE_MODEL') || 'claude-haiku-4-5-20251001';

    const rawBody = await req.json();
    const { message, history, debtData, contextNotes, context } = rawBody;

    // Validate context
    if (context !== 'intake' && context !== 'summary') {
      return new Response(
        JSON.stringify({ reply: "I'm having a little trouble right now — please try again in a moment." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize message
    const sanitized = sanitizeMessage(message);
    if (!sanitized) {
      return new Response(
        JSON.stringify({ reply: "I'm having a little trouble right now — please try again in a moment." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt
    let systemPrompt = context === 'intake' ? INTAKE_SYSTEM_PROMPT : SUMMARY_SYSTEM_PROMPT;

    // Append debt data context for summary mode
    if (context === 'summary' && debtData && typeof debtData === 'object') {
      systemPrompt += `\n\nThe user's computed debt data:\n${JSON.stringify(debtData).slice(0, 2000)}`;
    }

    // Append context notes for intake if available
    if (context === 'intake' && contextNotes && typeof contextNotes === 'string') {
      systemPrompt += `\n\nPrior context from this session:\n${contextNotes.slice(0, 1000)}`;
    }

    // Build messages array from history
    const claudeMessages: Array<{ role: string; content: string }> = [];

    if (Array.isArray(history)) {
      for (const msg of history.slice(-20)) { // Limit history to last 20 messages
        if (msg && typeof msg === 'object' && typeof msg.role === 'string' && typeof msg.content === 'string') {
          claudeMessages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: sanitizeMessage(msg.content) || '[empty]',
          });
        }
      }
    }

    // Add current message
    claudeMessages.push({ role: 'user', content: sanitized });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status);
      return new Response(
        JSON.stringify({ reply: "I'm having a little trouble right now — please try again in a moment." }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const reply = result.content?.[0]?.text ?? "I'm having a little trouble right now — please try again in a moment.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('april-chat error:', err);
    return new Response(
      JSON.stringify({ reply: "I'm having a little trouble right now — please try again in a moment." }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
