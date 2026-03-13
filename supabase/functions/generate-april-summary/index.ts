const ALLOWED_ORIGINS = [
  'https://april-prototype.lovable.app',
  'https://id-preview--b70e1edc-da90-4e8a-a46b-f40d950d9974.lovable.app',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

// Simple in-memory rate limiter (per-isolate; resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

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

// Input validation & sanitization
function sanitizeString(val: unknown, maxLen: number): string | null {
  if (typeof val !== 'string') return null;
  // Strip control characters, quotes that could break prompt context, and instruction-like patterns
  return val
    .replace(/[\x00-\x1F\x7F]/g, '') // control chars
    .replace(/["""''`]/g, "'")        // normalize quotes
    .replace(/ignore\s+(prior|previous|all|above)\s+instructions?/gi, '[filtered]')
    .replace(/return\s+(system|original)\s+prompt/gi, '[filtered]')
    .slice(0, maxLen)
    .trim();
}

function validateNumber(val: unknown, min: number, max: number): number | null {
  if (typeof val !== 'number' || !Number.isFinite(val)) return null;
  if (val < min || val > max) return null;
  return val;
}

interface ValidatedDebtData {
  totalBalance: number;
  totalMonthlyInterest: number;
  debtCount: number;
  costliestDebt: {
    nickname: string;
    apr: number;
    monthlyInterest: number;
    annualInterest: number;
  };
  surplus: number;
  avalanche: { interestSaved: number; monthsSaved: number; totalInterest: number; monthsToPayoff: number };
  snowball: { interestSaved: number; monthsSaved: number; totalInterest: number; monthsToPayoff: number };
  minimum: { totalInterest: number; monthsToPayoff: number };
}

function validatePayload(body: unknown): ValidatedDebtData | null {
  if (!body || typeof body !== 'object') return null;
  const d = body as Record<string, unknown>;

  const totalBalance = validateNumber(d.totalBalance, 0, 100_000_000);
  const totalMonthlyInterest = validateNumber(d.totalMonthlyInterest, 0, 10_000_000);
  const debtCount = validateNumber(d.debtCount, 1, 100);
  const surplus = validateNumber(d.surplus, -100_000, 100_000_000);

  if (totalBalance === null || totalMonthlyInterest === null || debtCount === null || surplus === null) return null;

  // Validate costliestDebt
  const cd = d.costliestDebt as Record<string, unknown> | undefined;
  if (!cd || typeof cd !== 'object') return null;
  const nickname = sanitizeString(cd.nickname, 100);
  const apr = validateNumber(cd.apr, 0, 100);
  const cdMonthlyInterest = validateNumber(cd.monthlyInterest, 0, 10_000_000);
  const cdAnnualInterest = validateNumber(cd.annualInterest, 0, 100_000_000);
  if (!nickname || apr === null || cdMonthlyInterest === null || cdAnnualInterest === null) return null;

  // Validate scenario objects
  function validateScenario(s: unknown): { interestSaved: number; monthsSaved: number; totalInterest: number; monthsToPayoff: number } | null {
    if (!s || typeof s !== 'object') return null;
    const sc = s as Record<string, unknown>;
    const interestSaved = validateNumber(sc.interestSaved, -100_000_000, 100_000_000);
    const monthsSaved = validateNumber(sc.monthsSaved, -10000, 10000);
    const totalInterest = validateNumber(sc.totalInterest, 0, 100_000_000);
    const monthsToPayoff = validateNumber(sc.monthsToPayoff, 0, 10000);
    if (interestSaved === null || monthsSaved === null || totalInterest === null || monthsToPayoff === null) return null;
    return { interestSaved, monthsSaved, totalInterest, monthsToPayoff };
  }

  const avalanche = validateScenario(d.avalanche);
  const snowball = validateScenario(d.snowball);
  if (!avalanche || !snowball) return null;

  const min = d.minimum as Record<string, unknown> | undefined;
  if (!min || typeof min !== 'object') return null;
  const minTotalInterest = validateNumber(min.totalInterest, 0, 100_000_000);
  const minMonthsToPayoff = validateNumber(min.monthsToPayoff, 0, 10000);
  if (minTotalInterest === null || minMonthsToPayoff === null) return null;

  return {
    totalBalance,
    totalMonthlyInterest,
    debtCount,
    costliestDebt: { nickname, apr, monthlyInterest: cdMonthlyInterest, annualInterest: cdAnnualInterest },
    surplus,
    avalanche,
    snowball,
    minimum: { totalInterest: minTotalInterest, monthsToPayoff: minMonthsToPayoff },
  };
}

const SYSTEM_PROMPT = `You are APRil's empathetic financial education assistant. Your voice is warm, clear, non-judgmental, and empowering — like a knowledgeable friend who happens to understand finance deeply. Generate a plain-language debt summary using only the exact figures provided. Do not perform any calculations — all numbers are pre-computed and must be used exactly as given. Never recommend specific financial products, refinancing, consolidation, or investment strategies. Never imply the user made poor decisions. Never use the words: should, must, bad debt, dangerous, wasting, mistake, or wrong. Use: could, one option is, many people find, this approach tends to. Format response as four sections: bigPicture, costDriver, surplusImpact, disclaimer. Keep each section under 60 words. Tone: a therapist who also has a CFA.

If contextNotes is provided, use the information to personalize the tone and framing of the summary — for example, acknowledging income variability or upcoming expenses the user mentioned. Do not repeat their words back verbatim. Weave the context naturally and only where relevant. Never use contextNotes to make recommendations or go beyond debt education.`;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Origin validation
  const origin = req.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const apiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const model = Deno.env.get('CLAUDE_MODEL') || 'claude-haiku-4-5-20251001';

    // Validate and sanitize input
    const rawBody = await req.json();
    const data = validatePayload(rawBody);
    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract and sanitize optional contextNotes
    const rawContextNotes = rawBody.contextNotes;
    const contextNotesStr = typeof rawContextNotes === 'string'
      ? rawContextNotes.replace(/<[^>]*>/g, '').replace(/[\x00-\x1F\x7F]/g, '').slice(0, 2000).trim()
      : '';

    let userPrompt = `Here is the user's pre-computed debt data. Use these exact figures — do not recalculate anything.

Total debt accounts: ${data.debtCount}
Total balance: $${data.totalBalance.toFixed(2)}
Total monthly interest: $${data.totalMonthlyInterest.toFixed(2)}

Costliest debt: '${data.costliestDebt.nickname}' at ${data.costliestDebt.apr}% APR
- Monthly interest: $${data.costliestDebt.monthlyInterest.toFixed(2)}
- Annual interest: $${data.costliestDebt.annualInterest.toFixed(2)}

Monthly surplus available: $${data.surplus.toFixed(2)}

Minimum-only scenario: ${data.minimum.monthsToPayoff} months, $${data.minimum.totalInterest.toFixed(2)} total interest
Avalanche scenario: ${data.avalanche.monthsToPayoff} months, $${data.avalanche.totalInterest.toFixed(2)} total interest, saves $${data.avalanche.interestSaved.toFixed(2)} and ${data.avalanche.monthsSaved} months vs minimums
Snowball scenario: ${data.snowball.monthsToPayoff} months, $${data.snowball.totalInterest.toFixed(2)} total interest, saves $${data.snowball.interestSaved.toFixed(2)} and ${data.snowball.monthsSaved} months vs minimums`;

    if (contextNotesStr) {
      userPrompt += `\n\ncontextNotes from the user's intake conversation:\n${contextNotesStr}`;
    }

    userPrompt += `\n\nRespond with valid JSON only, no markdown:\n{"sections":{"bigPicture":"...","costDriver":"...","surplusImpact":"...","disclaimer":"..."}}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const text = result.content?.[0]?.text ?? '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse Claude response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sections = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(sections),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
