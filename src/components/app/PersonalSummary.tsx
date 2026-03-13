import { useState, useEffect, useMemo, useCallback } from "react";
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
} from "@/lib/debtEngine";
import { supabase } from "@/integrations/supabase/client";
import SummaryChat from "@/components/app/SummaryChat";

interface PersonalSummaryProps {
  debts: DebtInput[];
  surplus: number;
  onGoToStep: (step: number) => void;
  contextNotes?: string;
}

interface SummarySections {
  bigPicture: string;
  costDriver: string;
  surplusImpact: string;
  disclaimer: string;
}

const PersonalSummary = ({ debts, surplus, onGoToStep }: PersonalSummaryProps) => {
  const analyses = useMemo(() => analyzeDebts(debts), [debts]);
  const scenarios = useMemo(() => runAllScenarios(debts, surplus), [debts, surplus]);

  const totalBalance = analyses.reduce((s, d) => s + d.balance, 0);
  const totalMonthlyInterest = analyses.reduce((s, d) => s + d.monthlyInterest, 0);
  const costliest = analyses[0];

  const minimumScenario = scenarios.find((s) => s.strategy === "minimum")!;
  const avalancheScenario = scenarios.find((s) => s.strategy === "avalanche")!;
  const snowballScenario = scenarios.find((s) => s.strategy === "snowball")!;

  const [sections, setSections] = useState<SummarySections | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // JS fallback generator
  const buildFallbackSections = useCallback((): SummarySections => {
    const bigPicture = `You're managing ${debts.length} debt account${debts.length !== 1 ? "s" : ""} totaling ${formatCurrency(totalBalance)}. Right now, you're paying ${formatCurrencyCents(totalMonthlyInterest)} in interest every single month — before a dollar touches your actual balance.`;

    const costDriver = `Your ${costliest.nickname} is your biggest cost driver. At ${costliest.apr}%, it's generating ${formatCurrencyCents(costliest.monthlyInterest)} in interest charges every month. Over a year, that's ${formatCurrency(costliest.annualInterest)} — just to stand still.`;

    let surplusImpact: string;
    if (surplus <= 0) {
      surplusImpact = `Right now, you're paying minimums only. If you could find even a small amount of extra money each month, it could meaningfully shorten your payoff timeline and reduce total interest.`;
    } else {
      const avalancheSaved = avalancheScenario.interestSavedVsMinimum;
      const snowballSaved = snowballScenario.interestSavedVsMinimum;
      const avalancheMonths = minimumScenario.monthsToPayoff - avalancheScenario.monthsToPayoff;
      const snowballMonths = minimumScenario.monthsToPayoff - snowballScenario.monthsToPayoff;

      if (avalancheSaved >= snowballSaved) {
        surplusImpact = `With your ${formatCurrency(surplus)}/month surplus, you have two strong options. The avalanche approach could save you ${formatCurrency(avalancheSaved)} in interest and get you debt-free ${avalancheMonths} months sooner. The snowball approach could save you ${formatCurrency(snowballSaved)} and finish ${snowballMonths} months earlier — many people find the quick wins keep them motivated.`;
      } else {
        surplusImpact = `With your ${formatCurrency(surplus)}/month surplus, you have two strong options. The snowball approach could save you ${formatCurrency(snowballSaved)} in interest and get you debt-free ${snowballMonths} months sooner. The avalanche approach could save you ${formatCurrency(avalancheSaved)} and finish ${avalancheMonths} months earlier — this approach tends to minimize total cost.`;
      }
    }

    const disclaimer = `These projections assume consistent payments and stable interest rates. Life changes — and so can your plan. Treat this as a compass, not a contract.`;

    return { bigPicture, costDriver, surplusImpact, disclaimer };
  }, [debts, surplus, totalBalance, totalMonthlyInterest, costliest, avalancheScenario, snowballScenario, minimumScenario]);

  // Fetch AI summary
  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      setLoading(true);
      setVisibleCards([]);

      try {
        const payload = {
          totalBalance,
          totalMonthlyInterest,
          debtCount: debts.length,
          costliestDebt: {
            nickname: costliest.nickname,
            apr: costliest.apr,
            monthlyInterest: costliest.monthlyInterest,
            annualInterest: costliest.annualInterest,
          },
          surplus,
          avalanche: {
            interestSaved: avalancheScenario.interestSavedVsMinimum,
            monthsSaved: minimumScenario.monthsToPayoff - avalancheScenario.monthsToPayoff,
            totalInterest: avalancheScenario.totalInterestPaid,
            monthsToPayoff: avalancheScenario.monthsToPayoff,
          },
          snowball: {
            interestSaved: snowballScenario.interestSavedVsMinimum,
            monthsSaved: minimumScenario.monthsToPayoff - snowballScenario.monthsToPayoff,
            totalInterest: snowballScenario.totalInterestPaid,
            monthsToPayoff: snowballScenario.monthsToPayoff,
          },
          minimum: {
            totalInterest: minimumScenario.totalInterestPaid,
            monthsToPayoff: minimumScenario.monthsToPayoff,
          },
        };

        const { data, error } = await supabase.functions.invoke("generate-april-summary", {
          body: payload,
        });

        if (cancelled) return;

        if (error || !data?.sections) {
          // Silent fallback
          setSections(buildFallbackSections());
        } else {
          setSections(data.sections);
        }
      } catch {
        if (!cancelled) {
          setSections(buildFallbackSections());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSummary();
    return () => { cancelled = true; };
  }, [debts, surplus, totalBalance, totalMonthlyInterest, costliest, avalancheScenario, snowballScenario, minimumScenario, buildFallbackSections]);

  // Staggered fade-in
  useEffect(() => {
    if (loading || !sections) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 4; i++) {
      timers.push(
        setTimeout(() => {
          setVisibleCards((prev) => [...prev, i]);
        }, i * 200)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [loading, sections]);

  const cardData = sections
    ? [
        {
          icon: <Eye size={20} className="text-primary" />,
          iconBg: "bg-primary/10",
          title: "The big picture",
          text: sections.bigPicture,
        },
        {
          icon: <TrendingUp size={20} className="text-secondary" />,
          iconBg: "bg-secondary/10",
          title: "What's driving the most cost",
          text: sections.costDriver,
        },
        {
          icon: <Lightbulb size={20} className="text-positive" />,
          iconBg: "bg-positive/10",
          title: surplus > 0 ? `What your ${formatCurrency(surplus)} can do` : "What your surplus can do",
          text: sections.surplusImpact,
        },
        {
          icon: <AlertCircle size={20} className="text-muted-foreground" />,
          iconBg: "bg-muted",
          title: "A note on these numbers",
          text: sections.disclaimer,
        },
      ]
    : [];

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

      {/* Loading state */}
      {loading && (
        <div className="space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <Card
              key={i}
              className="border border-border bg-card overflow-hidden"
              style={{
                borderRadius: theme.radius.card,
                boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
              }}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg bg-primary/10"
                    style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                  />
                  <div
                    className="h-5 w-48 rounded bg-muted"
                    style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                  />
                </div>
                <div className="space-y-2">
                  <div
                    className="h-4 w-full rounded bg-muted"
                    style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                  />
                  <div
                    className="h-4 w-3/4 rounded bg-muted"
                    style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-center font-body text-sm text-muted-foreground" style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
            Preparing your summary...
          </p>
        </div>
      )}

      {/* Summary cards with staggered fade-in */}
      {!loading && sections && (
        <>
          {cardData.map((card, i) => (
            <Card
              key={i}
              className="border border-border bg-card overflow-hidden transition-all duration-500"
              style={{
                borderRadius: theme.radius.card,
                boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
                opacity: visibleCards.includes(i) ? 1 : 0,
                transform: visibleCards.includes(i) ? "translateY(0)" : "translateY(12px)",
              }}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">{card.title}</h3>
                </div>
                <p className="font-body text-base text-foreground leading-relaxed">{card.text}</p>
              </CardContent>
            </Card>
          ))}

          {/* Disclaimer card */}
          <Card
            className="border-0 overflow-hidden transition-all duration-500"
            style={{
              borderRadius: theme.radius.card,
              borderLeft: "4px solid hsl(var(--secondary))",
              background: "hsl(var(--background))",
              opacity: visibleCards.includes(3) ? 1 : 0,
              transform: visibleCards.includes(3) ? "translateY(0)" : "translateY(12px)",
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
        </>
      )}
    </div>
  );
};

export default PersonalSummary;
