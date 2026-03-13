import { useState } from "react";
import Layout from "@/components/Layout";
import { theme } from "@/theme/config";
import { ChevronRight, ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Expandable "Tell me more..." toggle                                */
/* ------------------------------------------------------------------ */
const Expandable = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-sm font-body italic text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Tell me more…
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-[1000px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-sm text-muted-foreground font-body leading-relaxed pl-5 border-l-2 border-primary/20">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Formula pill                                                       */
/* ------------------------------------------------------------------ */
const Formula = ({ children }: { children: React.ReactNode }) => (
  <div className="my-5 inline-block rounded-full px-5 py-2.5 bg-primary/10 text-primary font-mono text-sm sm:text-base whitespace-nowrap overflow-x-auto max-w-full">
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Section divider                                                    */
/* ------------------------------------------------------------------ */
const Divider = () => (
  <hr className="my-12 border-t border-border" />
);

/* ------------------------------------------------------------------ */
/*  Strategy card for Section 4                                        */
/* ------------------------------------------------------------------ */
interface StrategyCardProps {
  title: string;
  headerColor: string;
  accentClass: string;
  howItWorks: string;
  result: string;
  chooseIf: string;
  expandedContent: string;
}

const StrategyCard = ({
  title,
  headerColor,
  accentClass,
  howItWorks,
  result,
  chooseIf,
  expandedContent,
}: StrategyCardProps) => (
  <div
    className="rounded-xl border border-border bg-card overflow-hidden flex flex-col"
    style={{ borderRadius: theme.radius.card }}
  >
    {/* Header band */}
    <div className={`px-5 py-3 ${headerColor}`}>
      <h4 className="font-heading text-base font-bold text-white">{title}</h4>
    </div>

    <div className="p-5 flex-1 flex flex-col gap-4">
      {/* How it works */}
      <div>
        <p className={`text-xs font-body font-bold uppercase tracking-wide mb-1 ${accentClass}`}>
          How it works:
        </p>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {howItWorks}
        </p>
      </div>

      {/* Result */}
      <div>
        <p className={`text-xs font-body font-bold uppercase tracking-wide mb-1 ${accentClass}`}>
          Result:
        </p>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {result}
        </p>
      </div>

      {/* Choose if */}
      <div>
        <p className={`text-xs font-body font-bold uppercase tracking-wide mb-1 ${accentClass}`}>
          Choose if:
        </p>
        <p className="text-sm text-muted-foreground font-body leading-relaxed">
          {chooseIf}
        </p>
      </div>

      <Expandable>{expandedContent}</Expandable>
    </div>
  </div>
);

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
const BehindTheMath = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 behind-the-math-page">
        {/* ---- Header ---- */}
        <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
          Behind the Math.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-body max-w-2xl">
          {theme.brand.name}'s calculations are fully transparent. Here's exactly how everything works — and why it matters.
        </p>

        <p className="mt-6 text-sm text-muted-foreground font-body leading-relaxed max-w-2xl">
          Every number {theme.brand.name} shows you is computed deterministically from the inputs you provide. No estimates are invented, no AI is involved in the calculations. This page explains the formulas, the logic, and the reasoning behind each output — so you can trust what you see.
        </p>

        {/* ================================================================ */}
        {/*  SECTION 1 — Monthly Interest Cost                               */}
        {/* ================================================================ */}
        <Divider />

        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          How we calculate monthly interest
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
          For each debt, {theme.brand.name} computes your monthly interest charge using the standard formula: Monthly Interest = (Balance × APR) ÷ 12. This represents the dollar amount of interest accruing on a debt each month before any principal reduction occurs. It is the most direct measure of what a debt costs you right now.
        </p>
        <Formula>Monthly Interest = (Balance × APR ÷ 100) ÷ 12</Formula>
        <Expandable>
          For example: a $5,000 balance at 20% APR generates ($5,000 × 0.20) ÷ 12 = $83.33 in interest every month. None of that $83.33 reduces your balance — it is the cost of carrying the debt. Over a year, that single debt costs $1,000 in interest before a dollar of principal is repaid. {theme.brand.name} surfaces this number because most minimum payment structures obscure it entirely.
        </Expandable>

        {/* ================================================================ */}
        {/*  SECTION 2 — Annual Interest Cost                                */}
        {/* ================================================================ */}
        <Divider />

        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Annual interest cost
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
          Annual interest is simply monthly interest multiplied by 12. It translates the monthly cost into a number that is easier to compare against income, savings, or other annual expenses. It answers the question: what does carrying this debt cost me per year?
        </p>
        <Formula>Annual Interest = Monthly Interest × 12</Formula>
        <Expandable>
          Annual interest cost is useful for reframing debt in terms you already think in. If your annual interest across all debts is $4,800, that is $400 per month — every month — going to lenders rather than to your goals. {theme.brand.name} uses this figure to help you see debt not as a balance but as an ongoing expense.
        </Expandable>

        {/* ================================================================ */}
        {/*  SECTION 3 — Composite Impact Score                              */}
        {/* ================================================================ */}
        <Divider />

        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          How {theme.brand.name} ranks your debts
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
          {theme.brand.name} ranks debts by a Composite Impact Score: Balance × APR. This score weights both the size of a debt and its cost rate simultaneously. A large low-rate debt and a small high-rate debt may cost similar amounts monthly — the impact score surfaces which deserves attention first based on total cost exposure.
        </p>
        <Formula>Impact Score = Balance × (APR ÷ 100)</Formula>
        <Expandable>
          The impact score is a practical prioritization tool, not a standard industry metric. A $10,000 balance at 20% APR has an impact score of 2,000. A $2,000 balance at 25% APR has a score of 500. The first debt generates four times the cost exposure even though its rate is lower. Sorting by impact score ensures {theme.brand.name} directs your attention to where the real damage is occurring — not simply the highest rate or largest balance in isolation.
        </Expandable>

        {/* ================================================================ */}
        {/*  SECTION 4 — Three Repayment Scenarios                           */}
        {/* ================================================================ */}
        <Divider />

        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          How the three repayment paths are modeled
        </h2>
        <p className="mt-3 mb-8 text-sm text-muted-foreground font-body leading-relaxed">
          {theme.brand.name} simulates three strategies side-by-side using your actual debt data. No recommendation is made — you see the trade-offs and decide. In every scenario, all minimum payments are made first. The monthly surplus is then applied according to each strategy's logic. When a debt is fully paid off, its freed minimum payment rolls into the surplus for the next target debt.
        </p>

        {/* Strategy cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StrategyCard
            title="Minimum Only"
            headerColor="bg-[hsl(var(--warning))]"
            accentClass="text-[hsl(var(--warning))]"
            howItWorks="Pay the minimum required amount on every debt each month. Nothing extra."
            result="Debt stays alive the longest. Interest compounds. Most expensive path — often by a wide margin."
            chooseIf="Baseline comparison only. Shows the true cost of inaction."
            expandedContent="Minimum payments are structured to extend repayment as long as possible. On a credit card with a 24% APR and a $5,000 balance, a minimum payment of approximately $100/month results in over 7 years of payments and more than $3,500 in interest — more than 70% of the original balance paid in interest alone. The minimum-only scenario makes this cost visible so users can make an informed choice."
          />
          <StrategyCard
            title="Avalanche"
            headerColor="bg-primary"
            accentClass="text-primary"
            howItWorks="Pay minimums on all debts. Throw every extra dollar at the highest-APR debt first. Once it's gone, roll that payment to the next highest."
            result="Mathematically optimal. Minimizes total interest paid over time. Fastest for high-APR debt."
            chooseIf="Best if the goal is to pay as little interest as possible."
            expandedContent="The Avalanche method is the most efficient use of surplus dollars. By attacking the highest interest rate first, every extra dollar eliminates the most expensive cost per dollar of debt. The tradeoff is psychological: if your highest-APR debt also carries a large balance, it may take many months before any debt is fully eliminated. For users motivated by numbers and long-term efficiency, Avalanche is the most powerful strategy — but only if they stick with it."
          />
          <StrategyCard
            title="Snowball"
            headerColor="bg-secondary"
            accentClass="text-secondary"
            howItWorks="Pay minimums on all debts. Throw every extra dollar at the smallest balance first. Once it's gone, roll that payment to the next smallest."
            result="Slightly more interest than Avalanche in most cases. But faster early wins — debts disappear quickly."
            chooseIf="Best if motivation and momentum matter more than math."
            expandedContent="Behavioral finance research consistently shows that early wins improve follow-through. When a user eliminates their first debt quickly — even if it is not the most expensive — motivation to continue increases meaningfully. The Snowball method accepts a higher total interest cost in exchange for psychological momentum. For many people, this tradeoff is rational: the strategy you actually maintain outperforms the optimal one you abandon."
          />
        </div>

        {/* Worked example bar */}
        <div
          className="mt-6 rounded-xl border-t border-border bg-background p-5 sm:p-6"
          style={{ borderRadius: theme.radius.card }}
        >
          <p className="text-sm font-body text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Same person, same debts, same $300 extra/month:</span>{" "}
            Personal Loan $3K @ 8% · Credit Card $6K @ 22% · Auto $10K @ 6%
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-body">
            <span>
              →{" "}
              <span className="font-semibold text-secondary">
                Avalanche: 32 months · $2,458 total interest
              </span>
            </span>
            <span>
              →{" "}
              <span className="font-semibold text-primary">
                Snowball: 33 months · $2,944 total interest
              </span>
            </span>
            <span>
              →{" "}
              <span className="font-bold text-foreground">
                Avalanche saves $486
              </span>
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/*  SECTION 5 — Assumptions                                         */}
        {/* ================================================================ */}
        <Divider />

        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          What these calculations assume
        </h2>
        <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
          {theme.brand.name}'s models assume: APRs remain constant over the repayment period; minimum payments remain fixed at the amounts entered; no new debt is added; payments are made consistently each month. Real-world outcomes will vary. {theme.brand.name} is a directional planning tool, not a precise forecast. Treat these projections as a compass, not a contract.
        </p>

        {/* ---- Disclaimer callout ---- */}
        <div
          className="mt-12 rounded-xl border border-border bg-card p-5"
          style={{ borderRadius: theme.radius.card }}
        >
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            <span className="font-semibold text-foreground">Disclaimer:</span>{" "}
            {theme.brand.name} is an educational tool only. Outputs are estimates based on your inputs and do not constitute financial advice. Consult a licensed financial professional for personalized guidance.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default BehindTheMath;
