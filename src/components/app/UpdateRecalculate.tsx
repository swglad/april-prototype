import { useState, useMemo, useCallback } from "react";
import { theme } from "@/theme/config";
import DebtCard, { DebtEntry, DebtType } from "@/components/app/DebtCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Star, ArrowUp, ArrowDown, Minus, RotateCcw } from "lucide-react";
import type { DebtInput } from "@/lib/debtEngine";
import { runAllScenarios, formatCurrency } from "@/lib/debtEngine";

interface UpdateRecalculateProps {
  debts: DebtEntry[];
  surplus: string;
  onDebtsChange: (debts: DebtEntry[]) => void;
  onSurplusChange: (surplus: string) => void;
  onRecalculate: () => void;
  onStartOver: () => void;
}

function parseNum(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

const createEmptyDebt = (): DebtEntry => ({
  id: crypto.randomUUID(),
  nickname: "",
  type: "" as DebtType,
  balance: "",
  apr: "",
  minimumPayment: "",
  promoExpiration: "",
});

const UpdateRecalculate = ({
  debts,
  surplus,
  onDebtsChange,
  onSurplusChange,
  onRecalculate,
  onStartOver,
}: UpdateRecalculateProps) => {
  const [previousSnapshot] = useState(() => {
    const debtInputs: DebtInput[] = debts.map((d) => ({
      id: d.id,
      nickname: d.nickname,
      type: d.type,
      balance: parseNum(d.balance),
      apr: parseNum(d.apr),
      minimumPayment: parseNum(d.minimumPayment),
      promoExpiration: d.promoExpiration,
    }));
    const surplusNum = parseNum(surplus);
    const scenarios = runAllScenarios(debtInputs, surplusNum);
    const avalanche = scenarios.find((s) => s.strategy === "avalanche")!;
    return {
      totalInterest: avalanche.totalInterestPaid,
      monthsToPayoff: avalanche.monthsToPayoff,
    };
  });

  const [hasRecalculated, setHasRecalculated] = useState(false);
  const [newSnapshot, setNewSnapshot] = useState<{
    totalInterest: number;
    monthsToPayoff: number;
  } | null>(null);

  const handleDebtChange = useCallback(
    (id: string, field: keyof DebtEntry, value: string) => {
      onDebtsChange(
        debts.map((d) => (d.id === id ? { ...d, [field]: value, isExample: false } : d))
      );
    },
    [debts, onDebtsChange]
  );

  const handleRemoveDebt = useCallback(
    (id: string) => {
      onDebtsChange(debts.filter((d) => d.id !== id));
    },
    [debts, onDebtsChange]
  );

  const addDebt = () => {
    onDebtsChange([...debts, createEmptyDebt()]);
  };

  const handleRecalculate = () => {
    const debtInputs: DebtInput[] = debts.map((d) => ({
      id: d.id,
      nickname: d.nickname,
      type: d.type,
      balance: parseNum(d.balance),
      apr: parseNum(d.apr),
      minimumPayment: parseNum(d.minimumPayment),
      promoExpiration: d.promoExpiration,
    }));
    const surplusNum = parseNum(surplus);
    const scenarios = runAllScenarios(debtInputs, surplusNum);
    const avalanche = scenarios.find((s) => s.strategy === "avalanche")!;
    setNewSnapshot({
      totalInterest: avalanche.totalInterestPaid,
      monthsToPayoff: avalanche.monthsToPayoff,
    });
    setHasRecalculated(true);
  };

  const interestDiff = newSnapshot
    ? previousSnapshot.totalInterest - newSnapshot.totalInterest
    : 0;
  const monthsDiff = newSnapshot
    ? previousSnapshot.monthsToPayoff - newSnapshot.monthsToPayoff
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Your plan, updated.
        </h2>
        <p className="mt-2 font-body text-base text-muted-foreground leading-relaxed max-w-2xl">
          Change any numbers below and recalculate to see how your plan shifts.
        </p>
      </div>

      {/* Monthly Surplus */}
      <Card
        className="border border-border bg-card"
        style={{
          borderRadius: theme.radius.card,
          boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start gap-3 mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0 mt-0.5 cursor-help">
                  <Star size={20} className="text-positive fill-positive" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs font-body text-sm">
                This field has the biggest impact on your results.
              </TooltipContent>
            </Tooltip>
            <div className="flex-1">
              <Label
                htmlFor="surplus-update"
                className="font-body text-base font-semibold text-foreground"
              >
                Monthly surplus
              </Label>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Money left after all fixed expenses and minimum payments.
              </p>
            </div>
          </div>
          <div className="max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-muted-foreground text-lg">
                $
              </span>
              <Input
                id="surplus-update"
                value={surplus}
                onChange={(e) => onSurplusChange(e.target.value)}
                placeholder="e.g. 250"
                className="pl-8 h-12 text-lg font-body"
                style={{ borderRadius: theme.radius.input }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-foreground">Your Debts</h3>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={addDebt}
            className="rounded-full"
          >
            <Plus size={16} />
            Add a Debt
          </Button>
        </div>
        {debts.map((debt, index) => (
          <DebtCard
            key={debt.id}
            debt={debt}
            index={index}
            errors={{}}
            onChange={handleDebtChange}
            onRemove={handleRemoveDebt}
          />
        ))}
      </div>

      {/* Recalculate Button */}
      <Button
        variant="hero"
        size="xl"
        className="w-full font-heading text-lg"
        onClick={handleRecalculate}
      >
        Recalculate My Plan →
      </Button>

      {/* Comparison Panel */}
      {hasRecalculated && newSnapshot && (
        <Card
          className="border border-border bg-card overflow-hidden animate-fade-in"
          style={{
            borderRadius: theme.radius.card,
            boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
          }}
        >
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-heading text-lg font-bold text-foreground mb-6">
              How your plan changed
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Interest comparison */}
              <div className="space-y-2">
                <p className="font-body text-sm text-muted-foreground">Total Interest</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-body text-sm text-muted-foreground line-through">
                    {formatCurrency(previousSnapshot.totalInterest)}
                  </span>
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {formatCurrency(newSnapshot.totalInterest)}
                  </span>
                </div>
                {interestDiff !== 0 && (
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-body font-semibold ${
                      interestDiff > 0
                        ? "bg-secondary/10 text-secondary"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {interestDiff > 0 ? (
                      <ArrowUp size={14} />
                    ) : interestDiff < 0 ? (
                      <ArrowDown size={14} />
                    ) : (
                      <Minus size={14} />
                    )}
                    {interestDiff > 0
                      ? `${formatCurrency(interestDiff)} saved`
                      : `${formatCurrency(Math.abs(interestDiff))} more`}
                  </div>
                )}
              </div>

              {/* Months comparison */}
              <div className="space-y-2">
                <p className="font-body text-sm text-muted-foreground">Months to Debt-Free</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-body text-sm text-muted-foreground line-through">
                    {previousSnapshot.monthsToPayoff} mo
                  </span>
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {newSnapshot.monthsToPayoff} mo
                  </span>
                </div>
                {monthsDiff !== 0 && (
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-body font-semibold ${
                      monthsDiff > 0
                        ? "bg-secondary/10 text-secondary"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {monthsDiff > 0 ? (
                      <ArrowUp size={14} />
                    ) : monthsDiff < 0 ? (
                      <ArrowDown size={14} />
                    ) : (
                      <Minus size={14} />
                    )}
                    {monthsDiff > 0
                      ? `${monthsDiff} months sooner`
                      : `${Math.abs(monthsDiff)} months longer`}
                  </div>
                )}
              </div>
            </div>

            {/* Encouraging copy */}
            <p className="mt-6 font-body text-sm text-muted-foreground italic leading-relaxed">
              Even small changes to your plan matter over time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Continue to view updated results */}
      {hasRecalculated && (
        <Button
          variant="outline"
          size="lg"
          className="w-full font-body"
          onClick={onRecalculate}
        >
          View Updated Summary →
        </Button>
      )}

      {/* Start Over */}
      <div className="pt-4 border-t border-border">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
              <RotateCcw size={16} />
              Start Over
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="border border-border"
            style={{
              borderRadius: theme.radius.card,
              background: "hsl(var(--background))",
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading text-lg">
                Start fresh?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-body text-sm text-muted-foreground">
                This will clear all your debts and surplus. You'll begin from Step 1 with a
                blank slate. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="font-body"
                style={{ borderRadius: theme.radius.button }}
              >
                Keep My Data
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onStartOver}
                className="bg-primary text-primary-foreground font-body hover:bg-primary/90"
                style={{ borderRadius: theme.radius.button }}
              >
                Yes, Start Over
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UpdateRecalculate;
