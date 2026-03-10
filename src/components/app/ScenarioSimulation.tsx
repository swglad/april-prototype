import { useMemo } from "react";
import { theme } from "@/theme/config";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Zap, Target, Clock } from "lucide-react";
import type { DebtInput } from "@/lib/debtEngine";
import {
  runAllScenarios,
  formatCurrency,
  formatMonths,
  type ScenarioResult,
} from "@/lib/debtEngine";

const strategyMeta: Record<
  string,
  { icon: React.ElementType; colorClass: string; bgClass: string; barColor: string; description: string }
> = {
  minimum: {
    icon: Clock,
    colorClass: "text-positive",
    bgClass: "bg-positive/10",
    barColor: "hsl(var(--positive))",
    description: "Pay required minimums, no extra.",
  },
  avalanche: {
    icon: Zap,
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
    barColor: "hsl(var(--secondary))",
    description: "Attack the highest interest rate first — saves the most money.",
  },
  snowball: {
    icon: Target,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    barColor: "hsl(var(--primary))",
    description: "Clear the smallest balance first — builds momentum fast.",
  },
};

interface ScenarioSimulationProps {
  debts: DebtInput[];
  surplus: number;
}

const ScenarioCard = ({ scenario }: { scenario: ScenarioResult }) => {
  const meta = strategyMeta[scenario.strategy];
  const Icon = meta.icon;

  return (
    <Card
      className="border border-border bg-card overflow-hidden flex flex-col"
      style={{
        borderRadius: theme.radius.card,
        boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
      }}
    >
      <CardContent className="p-6 flex flex-col flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.bgClass} mb-4`}>
          <Icon size={24} className={meta.colorClass} />
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground">{scenario.label}</h3>
        <p className="font-body text-sm text-muted-foreground mt-1 mb-6">{meta.description}</p>

        <div className="space-y-4 mt-auto">
          <div className="flex justify-between items-baseline">
            <span className="font-body text-sm text-muted-foreground">Months to debt-free</span>
            <span className="font-heading text-2xl font-bold text-foreground">
              {formatMonths(scenario.monthsToPayoff)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="font-body text-sm text-muted-foreground">Total interest paid</span>
            <span className="font-body text-lg font-semibold text-foreground">
              {formatCurrency(scenario.totalInterestPaid)}
            </span>
          </div>
          {scenario.interestSavedVsMinimum > 0 && (
            <div className="flex justify-between items-center rounded-lg p-3 bg-secondary/10">
              <span className="font-body text-sm font-medium text-secondary flex items-center gap-1">
                <ArrowUp size={14} />
                Interest saved
              </span>
              <span className="font-heading text-lg font-bold text-secondary">
                {formatCurrency(scenario.interestSavedVsMinimum)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ScenarioSimulation = ({ debts, surplus }: ScenarioSimulationProps) => {
  const scenarios = useMemo(() => runAllScenarios(debts, surplus), [debts, surplus]);
  const maxMonths = Math.max(...scenarios.map((s) => s.monthsToPayoff), 1);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Three paths forward. You choose.
        </h2>
        <p className="mt-2 font-body text-base text-muted-foreground leading-relaxed max-w-2xl">
          All three beat doing nothing. The best one is the one you'll actually stick to.
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenarios.map((s) => (
          <ScenarioCard key={s.strategy} scenario={s} />
        ))}
      </div>

      {/* Timeline Visualization */}
      <Card
        className="border border-border bg-card overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <h3 className="font-heading text-lg font-bold text-foreground mb-6">
            Payoff Timeline Comparison
          </h3>
          <div className="space-y-4">
            {scenarios.map((s) => {
              const meta = strategyMeta[s.strategy];
              const pct = (s.monthsToPayoff / maxMonths) * 100;
              return (
                <div key={s.strategy} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-medium text-foreground">{s.label}</span>
                    <span className="font-body text-sm text-muted-foreground tabular-nums">
                      {formatMonths(s.monthsToPayoff)}
                    </span>
                  </div>
                  <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(pct, 3)}%`,
                        backgroundColor: meta.barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Neutral Framing Box */}
      <Card
        className="border-0 overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          background: "hsl(var(--secondary) / 0.08)",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <p className="font-body text-sm text-foreground leading-relaxed">
            <span className="font-semibold">Avalanche</span> is the mathematically optimal choice.{" "}
            <span className="font-semibold">Snowball</span> works better for many people psychologically.
            Research shows that the strategy you commit to matters more than the one that looks best on paper.
          </p>
          <p className="font-body text-xs text-muted-foreground mt-3">
            Source:{" "}
            <a
              href="https://www.consumerfinance.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline underline-offset-2 hover:text-secondary/80"
            >
              Consumer Financial Protection Bureau
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioSimulation;
