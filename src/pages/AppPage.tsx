import { useState, useMemo, useCallback } from "react";
import Layout from "@/components/Layout";
import { theme } from "@/theme/config";
import DebtCard, { DebtEntry, DebtType } from "@/components/app/DebtCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Star, AlertTriangle, CheckCircle2 } from "lucide-react";

const steps = [
  { number: 1, label: "Your Debts" },
  { number: 2, label: "Cost Breakdown" },
  { number: 3, label: "Repayment Scenarios" },
  { number: 4, label: "Your Summary" },
  { number: 5, label: "Update & Recalculate" },
];

const createEmptyDebt = (): DebtEntry => ({
  id: crypto.randomUUID(),
  nickname: "",
  type: "" as DebtType,
  balance: "",
  apr: "",
  minimumPayment: "",
  promoExpiration: "",
});

const exampleDebt: DebtEntry = {
  id: crypto.randomUUID(),
  nickname: "Chase Freedom Card",
  type: "credit_card",
  balance: "4200",
  apr: "24.99",
  minimumPayment: "85",
  promoExpiration: "",
  isExample: true,
};

// Completeness scoring
const REQUIRED_DEBT_FIELDS: (keyof DebtEntry)[] = ["nickname", "type", "balance", "apr", "minimumPayment"];

function computeCompleteness(surplus: string, debts: DebtEntry[]): number {
  if (debts.length === 0) return 0;

  // Surplus is worth double (2 points), each debt field is 1 point
  const totalDebtFieldPoints = debts.length * REQUIRED_DEBT_FIELDS.length;
  const surplusPoints = 2; // double weight
  const totalPoints = totalDebtFieldPoints + surplusPoints;

  let earned = 0;
  // Surplus
  if (surplus.trim() !== "") earned += surplusPoints;
  // Debt fields
  for (const debt of debts) {
    for (const f of REQUIRED_DEBT_FIELDS) {
      if (String(debt[f]).trim() !== "") earned += 1;
    }
  }

  return Math.min(100, Math.round((earned / totalPoints) * 100));
}

function parseNum(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

const AppPage = () => {
  const currentStep = 1;
  const [surplus, setSurplus] = useState("");
  const [debts, setDebts] = useState<DebtEntry[]>([exampleDebt]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSurplusWarning, setShowSurplusWarning] = useState(false);

  const completeness = useMemo(() => computeCompleteness(surplus, debts), [surplus, debts]);

  const handleDebtChange = useCallback((id: string, field: keyof DebtEntry, value: string) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value, isExample: false } : d))
    );
    // Clear error for this field on edit
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${id}-${field}`];
      return next;
    });
  }, []);

  const handleRemoveDebt = useCallback((id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addDebt = () => {
    setDebts((prev) => [...prev, createEmptyDebt()]);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const debt of debts) {
      if (!debt.nickname.trim()) newErrors[`${debt.id}-nickname`] = "Required";
      if (!debt.type) newErrors[`${debt.id}-type`] = "Required";
      if (!debt.balance.trim() || parseNum(debt.balance) <= 0) newErrors[`${debt.id}-balance`] = "Enter a valid balance";
      if (!debt.apr.trim() || parseNum(debt.apr) <= 0 || parseNum(debt.apr) > 100) newErrors[`${debt.id}-apr`] = "Enter a valid APR";
      if (!debt.minimumPayment.trim() || parseNum(debt.minimumPayment) <= 0) newErrors[`${debt.id}-minimumPayment`] = "Enter a valid amount";
    }

    setErrors(newErrors);

    // Surplus vs total minimums check
    const surplusNum = parseNum(surplus);
    const totalMins = debts.reduce((sum, d) => sum + parseNum(d.minimumPayment), 0);
    setShowSurplusWarning(surplusNum > 0 && surplusNum < totalMins);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!validate()) return;
    // Future: advance to step 2
  };

  // Progress bar color: amber at low, forest green at 100
  const progressColor =
    completeness >= 100
      ? "hsl(var(--secondary))"
      : `hsl(var(--positive))`;

  return (
    <Layout showFooter={false}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center flex-1 ${
                  step.number === currentStep
                    ? "text-primary"
                    : step.number < currentStep
                    ? "text-secondary"
                    : "text-muted-foreground/40"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-body font-semibold transition-colors ${
                    step.number === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.number < currentStep
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number}
                </div>
                <span className="mt-1.5 text-xs font-body font-medium hidden sm:block text-center leading-tight">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                backgroundColor: "hsl(var(--primary))",
              }}
            />
          </div>
        </div>

        {/* Welcome Card */}
        <Card
          className="mb-8 border-0 overflow-hidden"
          style={{
            borderRadius: theme.radius.card,
            background: "hsl(var(--primary) / 0.1)",
          }}
        >
          <CardContent className="p-8 sm:p-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Let's get the full picture.
            </h2>
            <p className="mt-3 font-body text-base text-muted-foreground leading-relaxed max-w-2xl">
              The more accurate your entries, the more useful your plan. This usually takes about 3 minutes.
            </p>
          </CardContent>
        </Card>

        {/* Completeness Score Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm font-medium text-foreground">
              Your plan accuracy: {completeness}%
            </span>
            {completeness >= 100 && (
              <span className="flex items-center gap-1.5 font-body text-sm font-semibold text-secondary">
                <CheckCircle2 size={16} />
                Your plan is ready to calculate ✓
              </span>
            )}
          </div>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${completeness}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        </div>

        {/* Monthly Surplus Input */}
        <Card
          className="mb-8 border border-border bg-card"
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
                <Label htmlFor="surplus" className="font-body text-base font-semibold text-foreground">
                  How much extra can you put toward debt each month?
                </Label>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  This is money left after all fixed expenses and minimum payments.
                </p>
              </div>
            </div>
            <div className="max-w-md">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-muted-foreground text-lg">$</span>
                <Input
                  id="surplus"
                  value={surplus}
                  onChange={(e) => setSurplus(e.target.value)}
                  placeholder="e.g. 250 — even a little goes a long way"
                  className="pl-8 h-12 text-lg font-body"
                  style={{ borderRadius: theme.radius.input }}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="mt-2 font-body text-xs text-muted-foreground cursor-help underline decoration-dotted underline-offset-2">
                    Not sure? A rough estimate is fine — you can always update it later.
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs font-body text-sm">
                  Your monthly surplus is whatever you have left after bills, groceries, and all minimum debt payments. Even $25/month makes a difference.
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Surplus Warning */}
        {showSurplusWarning && (
          <Card
            className="mb-6 border-0"
            style={{
              borderRadius: theme.radius.card,
              background: "hsl(var(--positive) / 0.12)",
            }}
          >
            <CardContent className="p-5 flex items-start gap-3">
              <AlertTriangle size={20} className="text-positive flex-shrink-0 mt-0.5" />
              <p className="font-body text-sm text-foreground leading-relaxed">
                <span className="font-semibold">Heads up</span> — your entries suggest your surplus may be lower than your total minimums. Double-check your numbers, or enter 0 if you're currently at minimums only. You can update this anytime.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Debt Cards */}
        <div className="space-y-6 mb-8">
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
              errors={submitted ? errors : {}}
              onChange={handleDebtChange}
              onRemove={handleRemoveDebt}
            />
          ))}

          {debts.length === 0 && (
            <Card
              className="border border-dashed border-border bg-card/50 text-center"
              style={{ borderRadius: theme.radius.card }}
            >
              <CardContent className="p-10">
                <p className="font-body text-muted-foreground">
                  No debts added yet. Click "Add a Debt" to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          variant="hero"
          size="xl"
          className="w-full font-heading text-lg"
          disabled={completeness < 100}
          onClick={handleSubmit}
        >
          Show Me My Debt Cost →
        </Button>
        {completeness < 100 && (
          <p className="mt-3 text-center font-body text-sm text-muted-foreground">
            Complete all fields above to continue.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default AppPage;
