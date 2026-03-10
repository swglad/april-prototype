const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are APRil's empathetic financial education assistant. Your voice is warm, clear, non-judgmental, and empowering — like a knowledgeable friend who happens to understand finance deeply. Generate a plain-language debt summary using only the exact figures provided. Do not perform any calculations — all numbers are pre-computed and must be used exactly as given. Never recommend specific financial products, refinancing, consolidation, or investment strategies. Never imply the user made poor decisions. Never use the words: should, must, bad debt, dangerous, wasting, mistake, or wrong. Use: could, one option is, many people find, this approach tends to. Format response as four sections: bigPicture, costDriver, surplusImpact, disclaimer. Keep each section under 60 words. Tone: a therapist who also has a CFA.`;

interface DebtData {
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
  avalanche: {
    interestSaved: number;
    monthsSaved: number;
    totalInterest: number;
    monthsToPayoff: number;
  };
  snowball: {
    interestSaved: number;
    monthsSaved: number;
    totalInterest: number;
    monthsToPayoff: number;
  };
  minimum: {
    totalInterest: number;
    monthsToPayoff: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const data: DebtData = await req.json();

    const userPrompt = `Here is the user's pre-computed debt data. Use these exact figures — do not recalculate anything.

Total debt accounts: ${data.debtCount}
Total balance: $${data.totalBalance.toFixed(2)}
Total monthly interest: $${data.totalMonthlyInterest.toFixed(2)}

Costliest debt: "${data.costliestDebt.nickname}" at ${data.costliestDebt.apr}% APR
- Monthly interest: $${data.costliestDebt.monthlyInterest.toFixed(2)}
- Annual interest: $${data.costliestDebt.annualInterest.toFixed(2)}

Monthly surplus available: $${data.surplus.toFixed(2)}

Minimum-only scenario: ${data.minimum.monthsToPayoff} months, $${data.minimum.totalInterest.toFixed(2)} total interest
Avalanche scenario: ${data.avalanche.monthsToPayoff} months, $${data.avalanche.totalInterest.toFixed(2)} total interest, saves $${data.avalanche.interestSaved.toFixed(2)} and ${data.avalanche.monthsSaved} months vs minimums
Snowball scenario: ${data.snowball.monthsToPayoff} months, $${data.snowball.totalInterest.toFixed(2)} total interest, saves $${data.snowball.interestSaved.toFixed(2)} and ${data.snowball.monthsSaved} months vs minimums

Respond with valid JSON only, no markdown:
{"sections":{"bigPicture":"...","costDriver":"...","surplusImpact":"...","disclaimer":"..."}}`;

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
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const text = result.content?.[0]?.text ?? '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse Claude response:', text);
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
