import { useMemo } from "react";
import { theme } from "@/theme/config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Zap, Target, Clock, AlertTriangle, PartyPopper } from "lucide-react";
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

const ScenarioCard = ({ scenario, isSingleDebt }: { scenario: ScenarioResult; isSingleDebt: boolean }) => {
  const meta = strategyMeta[scenario.strategy];
  const Icon = meta.icon;
  const isPayableThisMonth = scenario.monthsToPayoff <= 1;
  const isOver30Years = scenario.monthsToPayoff > 360;

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
        <h3 className="font-heading text-xl font-bold text-foreground">
          {isSingleDebt && scenario.strategy !== "minimum"
            ? "With Surplus"
            : scenario.label}
        </h3>
        <p className="font-body text-sm text-muted-foreground mt-1 mb-6">
          {isSingleDebt && scenario.strategy !== "minimum"
            ? "Your surplus applied to your single debt."
            : meta.description}
        </p>

        <div className="space-y-4 mt-auto">
          <div className="flex justify-between items-baseline">
            <span className="font-body text-sm text-muted-foreground">Months to debt-free</span>
            <span className="font-heading text-2xl font-bold text-foreground">
              {isPayableThisMonth ? (
                <span className="flex items-center gap-1.5">
                  Payable this month
                  <Badge className="bg-primary/15 text-primary text-xs px-2 py-0.5 rounded-full font-body">
                    <PartyPopper size={12} className="mr-1" />
                    🎉
                  </Badge>
                </span>
              ) : isOver30Years ? (
                "30+ years"
              ) : (
                formatMonths(scenario.monthsToPayoff)
              )}
            </span>
          </div>

          {isOver30Years && (
            <div
              className="flex items-start gap-2 rounded-lg p-3"
              style={{ background: "hsl(var(--warning) / 0.12)" }}
            >
              <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="font-body text-xs text-foreground leading-relaxed">
                This debt may benefit from professional guidance — consider speaking with a nonprofit credit counselor.
              </p>
            </div>
          )}

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
  const isSingleDebt = debts.length === 1;
  const isZeroSurplus = surplus <= 0;

  // For single debt, show only minimum and one accelerated (avalanche)
  const displayScenarios = isSingleDebt
    ? scenarios.filter((s) => s.strategy === "minimum" || s.strategy === "avalanche")
    : scenarios;

  const maxMonths = Math.max(...displayScenarios.map((s) => Math.min(s.monthsToPayoff, 360)), 1);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          {isSingleDebt ? "Two paths forward." : "Three paths forward. You choose."}
        </h2>
        <p className="mt-2 font-body text-base text-muted-foreground leading-relaxed max-w-2xl">
          {isSingleDebt
            ? "See how your surplus impacts your single debt's payoff timeline."
            : "All three beat doing nothing. The best one is the one you'll actually stick to."}
        </p>
      </div>

      {/* Zero surplus warning */}
      {isZeroSurplus && (
        <Card
          className="border-0 overflow-hidden"
          style={{
            borderRadius: theme.radius.card,
            background: "hsl(var(--warning) / 0.12)",
          }}
        >
          <CardContent className="p-6 flex items-start gap-3">
            <AlertTriangle size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-foreground leading-relaxed">
              Add a monthly surplus in Step 1 to unlock accelerated repayment scenarios — even $50/month makes a meaningful difference.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scenario Cards */}
      <div className={`grid grid-cols-1 gap-5 ${
        isSingleDebt ? "md:grid-cols-2" : "md:grid-cols-3"
      } ${isZeroSurplus && !isSingleDebt ? "opacity-60 pointer-events-none" : ""}`}>
        {displayScenarios.map((s) => (
          <ScenarioCard key={s.strategy} scenario={s} isSingleDebt={isSingleDebt} />
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
            {displayScenarios.map((s) => {
              const meta = strategyMeta[s.strategy];
              const displayMonths = Math.min(s.monthsToPayoff, 360);
              const pct = (displayMonths / maxMonths) * 100;
              return (
                <div key={s.strategy} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-medium text-foreground">
                      {isSingleDebt && s.strategy !== "minimum" ? "With Surplus" : s.label}
                    </span>
                    <span className="font-body text-sm text-muted-foreground tabular-nums">
                      {s.monthsToPayoff > 360 ? "30+ years" : formatMonths(s.monthsToPayoff)}
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
      {!isSingleDebt && !isZeroSurplus && (
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
      )}
    </div>
  );
};

export default ScenarioSimulation;
