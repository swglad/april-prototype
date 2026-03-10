import { useMemo } from "react";
import { theme } from "@/theme/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RotateCcw, Eye, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import type { DebtInput } from "@/lib/debtEngine";
import {
  analyzeDebts,
  runAllScenarios,
  formatCurrency,
  formatCurrencyCents,
  formatMonths,
} from "@/lib/debtEngine";

interface PersonalSummaryProps {
  debts: DebtInput[];
  surplus: number;
  onGoToStep: (step: number) => void;
}

const PersonalSummary = ({ debts, surplus, onGoToStep }: PersonalSummaryProps) => {
  const analyses = useMemo(() => analyzeDebts(debts), [debts]);
  const scenarios = useMemo(() => runAllScenarios(debts, surplus), [debts, surplus]);

  const totalBalance = analyses.reduce((s, d) => s + d.balance, 0);
  const totalMonthlyInterest = analyses.reduce((s, d) => s + d.monthlyInterest, 0);
  const costliest = analyses[0]; // sorted by impact score

  const minimumScenario = scenarios.find((s) => s.strategy === "minimum")!;
  const avalancheScenario = scenarios.find((s) => s.strategy === "avalanche")!;
  const snowballScenario = scenarios.find((s) => s.strategy === "snowball")!;

  const buildSurplusCard = (): string => {
    if (surplus <= 0) {
      return `Right now, you're paying minimums only. If you could find even a small amount of extra money each month, it could meaningfully shorten your payoff timeline and reduce total interest.`;
    }

    const avalancheSaved = avalancheScenario.interestSavedVsMinimum;
    const snowballSaved = snowballScenario.interestSavedVsMinimum;
    const avalancheMonths = minimumScenario.monthsToPayoff - avalancheScenario.monthsToPayoff;
    const snowballMonths = minimumScenario.monthsToPayoff - snowballScenario.monthsToPayoff;

    let text = `With your ${formatCurrency(surplus)}/month surplus, you have two strong options. `;

    if (avalancheSaved >= snowballSaved) {
      text += `The avalanche approach could save you ${formatCurrency(avalancheSaved)} in interest and get you debt-free ${avalancheMonths} months sooner. `;
      text += `The snowball approach could save you ${formatCurrency(snowballSaved)} and finish ${snowballMonths} months earlier — many people find the quick wins keep them motivated.`;
    } else {
      text += `The snowball approach could save you ${formatCurrency(snowballSaved)} in interest and get you debt-free ${snowballMonths} months sooner. `;
      text += `The avalanche approach could save you ${formatCurrency(avalancheSaved)} and finish ${avalancheMonths} months earlier — this approach tends to minimize total cost.`;
    }

    return text;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Your personal debt picture.
        </h2>
        <p className="mt-2 font-body text-base text-muted-foreground leading-relaxed max-w-2xl">
          Here's what your numbers are telling us — in plain English.
        </p>
      </div>

      {/* Card 1 — The big picture */}
      <Card
        className="border border-border bg-card overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
              <Eye size={20} className="text-primary" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">The big picture</h3>
          </div>
          <p className="font-body text-base text-foreground leading-relaxed">
            You're managing {debts.length} debt account{debts.length !== 1 ? "s" : ""} totaling{" "}
            <span className="font-semibold">{formatCurrency(totalBalance)}</span>. Right now, you're
            paying{" "}
            <span className="font-semibold">{formatCurrencyCents(totalMonthlyInterest)}</span> in
            interest every single month — before a dollar touches your actual balance.
          </p>
        </CardContent>
      </Card>

      {/* Card 2 — What's driving the most cost */}
      <Card
        className="border border-border bg-card overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary/10">
              <TrendingUp size={20} className="text-secondary" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              What's driving the most cost
            </h3>
          </div>
          <p className="font-body text-base text-foreground leading-relaxed">
            Your <span className="font-semibold">{costliest.nickname}</span> is your biggest cost
            driver. At <span className="font-semibold">{costliest.apr}%</span>, it's generating{" "}
            <span className="font-semibold">{formatCurrencyCents(costliest.monthlyInterest)}</span>{" "}
            in interest charges every month. Over a year, that's{" "}
            <span className="font-semibold">{formatCurrency(costliest.annualInterest)}</span> — just
            to stand still.
          </p>
        </CardContent>
      </Card>

      {/* Card 3 — What your surplus can do */}
      <Card
        className="border border-border bg-card overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-positive/10">
              <Lightbulb size={20} className="text-positive" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              What your {surplus > 0 ? formatCurrency(surplus) : "surplus"} can do
            </h3>
          </div>
          <p className="font-body text-base text-foreground leading-relaxed">
            {buildSurplusCard()}
          </p>
        </CardContent>
      </Card>

      {/* Card 4 — A note on these numbers */}
      <Card
        className="border border-border bg-card overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted">
              <AlertCircle size={20} className="text-muted-foreground" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">
              A note on these numbers
            </h3>
          </div>
          <p className="font-body text-base text-foreground leading-relaxed">
            These projections assume consistent payments and stable interest rates. Life changes —
            and so can your plan. Treat this as a compass, not a contract.
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer card */}
      <Card
        className="border-0 overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          borderLeft: "4px solid hsl(var(--secondary))",
          background: "hsl(var(--background))",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <p className="font-body text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            About these estimates
          </p>
          <p className="font-body text-sm text-muted-foreground italic leading-relaxed">
            APRil is an educational tool only. Outputs are estimates based on your inputs and do not
            constitute financial advice. Consult a licensed financial professional for personalized
            guidance.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <Button
          variant="hero"
          size="xl"
          className="flex-1 font-heading text-lg gap-2"
          onClick={() => onGoToStep(5)}
        >
          <RotateCcw size={18} />
          Update My Numbers →
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => window.print()}
        >
          <FileText size={16} />
          Print / Save as PDF
        </Button>
      </div>
    </div>
  );
};

export default PersonalSummary;
