import { useState, useMemo, useCallback } from "react";
import Layout from "@/components/Layout";
import { theme } from "@/theme/config";
import DebtCard, { DebtEntry, DebtType } from "@/components/app/DebtCard";
import CostBreakdown from "@/components/app/CostBreakdown";
import ScenarioSimulation from "@/components/app/ScenarioSimulation";
import PersonalSummary from "@/components/app/PersonalSummary";
import UpdateRecalculate from "@/components/app/UpdateRecalculate";
import IntakeChatbot from "@/components/app/IntakeChatbot";
import ReferralScreen from "@/components/app/ReferralScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Star, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { type DebtInput, runAllScenarios } from "@/lib/debtEngine";

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

const REQUIRED_DEBT_FIELDS: (keyof DebtEntry)[] = ["nickname", "type", "balance", "apr", "minimumPayment"];

function computeCompleteness(surplus: string, debts: DebtEntry[]): number {
  if (debts.length === 0) return 0;
  const totalDebtFieldPoints = debts.length * REQUIRED_DEBT_FIELDS.length;
  const surplusPoints = 2;
  const totalPoints = totalDebtFieldPoints + surplusPoints;
  let earned = 0;
  if (surplus.trim() !== "") earned += surplusPoints;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [surplus, setSurplus] = useState("");
  const [debts, setDebts] = useState<DebtEntry[]>([exampleDebt]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showSurplusWarning, setShowSurplusWarning] = useState(false);
  const [stepTransition, setStepTransition] = useState(false);
  const [chatTranscript, setChatTranscript] = useState("");
  const [showReferral, setShowReferral] = useState(false);

  const completeness = useMemo(() => computeCompleteness(surplus, debts), [surplus, debts]);

  const debtInputs: DebtInput[] = useMemo(
    () =>
      debts.map((d) => ({
        id: d.id,
        nickname: d.nickname,
        type: d.type,
        balance: parseNum(d.balance),
        apr: parseNum(d.apr),
        minimumPayment: parseNum(d.minimumPayment),
        promoExpiration: d.promoExpiration,
      })),
    [debts]
  );

  const surplusNum = useMemo(() => parseNum(surplus), [surplus]);

  const handleDebtChange = useCallback((id: string, field: keyof DebtEntry, value: string) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value, isExample: false } : d))
    );
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
    const surplusVal = parseNum(surplus);
    const totalMins = debts.reduce((sum, d) => sum + parseNum(d.minimumPayment), 0);
    setShowSurplusWarning(surplusVal > 0 && surplusVal < totalMins);
    return Object.keys(newErrors).length === 0;
  };

  const checkReferralConditions = (): boolean => {
    const scenarios = runAllScenarios(debtInputs, surplusNum);
    const totalBalance = debtInputs.reduce((s, d) => s + d.balance, 0);
    const allOver240 = scenarios.every((s) => s.monthsToPayoff > 240);
    const allInterestOver5M = scenarios.every((s) => s.totalInterestPaid > 5_000_000);
    return allOver240 || totalBalance > 5_000_000 || allInterestOver5M;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!validate()) return;
    if (checkReferralConditions()) {
      setShowReferral(true);
      goToStep(2); // advance past Step 1 so referral screen renders
      return;
    }
    setShowReferral(false);
    goToStep(2);
  };

  const goToStep = (step: number) => {
    setStepTransition(true);
    setTimeout(() => {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setStepTransition(false), 50);
    }, 150);
  };

  const handleStartOver = () => {
    setDebts([createEmptyDebt()]);
    setSurplus("");
    setErrors({});
    setSubmitted(false);
    setShowSurplusWarning(false);
    goToStep(1);
  };

  const handleRecalculateAndView = () => {
    goToStep(2);
  };

  const progressColor =
    completeness >= 100 ? "hsl(var(--secondary))" : "hsl(var(--positive))";

  return (
    <Layout showFooter={false}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8 print:hidden">
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
                <button
                  onClick={() => step.number < currentStep && goToStep(step.number)}
                  disabled={step.number >= currentStep}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-body font-semibold transition-colors ${
                    step.number === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.number < currentStep
                      ? "bg-secondary text-secondary-foreground cursor-pointer hover:bg-secondary/80"
                      : "bg-muted text-muted-foreground"
                  }`}
                  aria-label={`Step ${step.number}: ${step.label}`}
                >
                  {step.number}
                </button>
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

        {/* Step content with transition */}
        <div
          className="transition-all duration-250 ease-out"
          style={{
            opacity: stepTransition ? 0 : 1,
            transform: stepTransition ? "translateY(10px)" : "translateY(0)",
          }}
        >
          {/* ─── STEP 1: Your Debts ─── */}
          {currentStep === 1 && (
            <>
              {/* Welcome Card */}
              <Card
                className="mb-8 border-0 overflow-hidden"
                style={{ borderRadius: theme.radius.card, background: "hsl(var(--primary) / 0.1)" }}
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
                    style={{ width: `${completeness}%`, backgroundColor: progressColor }}
                  />
                </div>
              </div>

              {/* Monthly Surplus Input */}
              <Card
                className="mb-8 border border-border bg-card"
                style={{ borderRadius: theme.radius.card, boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)" }}
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
                        aria-label="Monthly surplus amount"
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
                  style={{ borderRadius: theme.radius.card, background: "hsl(var(--positive) / 0.12)" }}
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
                  <Button type="button" variant="default" size="sm" onClick={addDebt} className="rounded-full">
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

              {/* Intake Chatbot */}
              <IntakeChatbot onTranscriptChange={setChatTranscript} />

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
            </>
          )}

          {/* ─── Referral Screen ─── */}
          {showReferral && currentStep !== 1 && currentStep !== 5 && (
            <ReferralScreen onUpdateEntries={() => { setShowReferral(false); goToStep(1); }} />
          )}

          {/* ─── STEP 2: Cost Breakdown ─── */}
          {currentStep === 2 && !showReferral && (
            <>
              <CostBreakdown debts={debtInputs} />
              <div className="flex items-center gap-4 mt-10 print:hidden">
                <Button variant="outline" size="lg" onClick={() => goToStep(1)} className="gap-2">
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <Button
                  variant="hero"
                  size="xl"
                  className="flex-1 font-heading text-lg"
                  onClick={() => goToStep(3)}
                >
                  See Repayment Scenarios →
                </Button>
              </div>
            </>
          )}

          {/* ─── STEP 3: Scenario Simulation ─── */}
          {currentStep === 3 && !showReferral && (
            <>
              <ScenarioSimulation debts={debtInputs} surplus={surplusNum} />
              <div className="flex items-center gap-4 mt-10 print:hidden">
                <Button variant="outline" size="lg" onClick={() => goToStep(2)} className="gap-2">
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <Button
                  variant="hero"
                  size="xl"
                  className="flex-1 font-heading text-lg"
                  onClick={() => goToStep(4)}
                >
                  View Your Summary →
                </Button>
              </div>
            </>
          )}

          {/* ─── STEP 4: Personal Summary ─── */}
          {currentStep === 4 && !showReferral && (
            <>
              <PersonalSummary debts={debtInputs} surplus={surplusNum} onGoToStep={goToStep} contextNotes={chatTranscript} />
              <div className="flex items-center gap-4 mt-10 print:hidden">
                <Button variant="outline" size="lg" onClick={() => goToStep(3)} className="gap-2">
                  <ArrowLeft size={16} />
                  Back
                </Button>
              </div>
            </>
          )}

          {/* ─── STEP 5: Update & Recalculate ─── */}
          {currentStep === 5 && (
            <>
              <UpdateRecalculate
                debts={debts}
                surplus={surplus}
                onDebtsChange={setDebts}
                onSurplusChange={setSurplus}
                onRecalculate={handleRecalculateAndView}
                onStartOver={handleStartOver}
              />
              <div className="flex items-center gap-4 mt-10 print:hidden">
                <Button variant="outline" size="lg" onClick={() => goToStep(4)} className="gap-2">
                  <ArrowLeft size={16} />
                  Back
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Pinned disclaimer on desktop */}
        <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border py-2 px-4 z-40 print:hidden">
          <p className="text-center font-body text-xs text-muted-foreground max-w-4xl mx-auto">
            {theme.brand.name} is an educational tool only. Outputs are estimates and do not constitute financial advice. Consult a licensed financial professional for personalized guidance.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AppPage;
