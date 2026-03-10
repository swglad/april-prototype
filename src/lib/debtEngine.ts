/**
 * APRil Debt Computation Engine
 * All math in pure JavaScript — no AI, no external API.
 */

export interface DebtInput {
  id: string;
  nickname: string;
  type: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  promoExpiration: string;
}

export interface DebtAnalysis {
  id: string;
  nickname: string;
  type: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  monthlyInterest: number;
  annualInterest: number;
  impactScore: number;
  promoExpiration: string;
}

export interface ScenarioResult {
  label: string;
  strategy: "minimum" | "avalanche" | "snowball";
  monthsToPayoff: number;
  totalInterestPaid: number;
  interestSavedVsMinimum: number;
  /** Monthly breakdown for timeline: array of { month, remainingBalance } */
  timeline: { month: number; remainingBalance: number }[];
}

export interface SummaryStats {
  costliestDebt: { name: string; monthlyInterest: number };
  highestAprDebt: { name: string; apr: number };
  totalInterestAtMinimums: { amount: number; months: number };
}

// ─── Core Calculations ───

export function monthlyInterest(balance: number, apr: number): number {
  return (balance * (apr / 100)) / 12;
}

export function annualInterest(balance: number, apr: number): number {
  return monthlyInterest(balance, apr) * 12;
}

export function compositeImpactScore(balance: number, apr: number): number {
  return balance * (apr / 100);
}

// ─── Analysis ───

export function analyzeDebts(debts: DebtInput[]): DebtAnalysis[] {
  return debts
    .map((d) => ({
      id: d.id,
      nickname: d.nickname,
      type: d.type,
      balance: d.balance,
      apr: d.apr,
      minimumPayment: d.minimumPayment,
      monthlyInterest: monthlyInterest(d.balance, d.apr),
      annualInterest: annualInterest(d.balance, d.apr),
      impactScore: compositeImpactScore(d.balance, d.apr),
      promoExpiration: d.promoExpiration,
    }))
    .sort((a, b) => b.impactScore - a.impactScore);
}

export function computeSummaryStats(analyses: DebtAnalysis[]): SummaryStats {
  const costliest = [...analyses].sort((a, b) => b.monthlyInterest - a.monthlyInterest)[0];
  const highestApr = [...analyses].sort((a, b) => b.apr - a.apr)[0];

  // Simulate minimum-only to get total interest
  const minResult = simulatePayoff(
    analyses.map((a) => ({ ...a })),
    0,
    "minimum"
  );

  return {
    costliestDebt: {
      name: costliest?.nickname ?? "",
      monthlyInterest: costliest?.monthlyInterest ?? 0,
    },
    highestAprDebt: {
      name: highestApr?.nickname ?? "",
      apr: highestApr?.apr ?? 0,
    },
    totalInterestAtMinimums: {
      amount: minResult.totalInterestPaid,
      months: minResult.monthsToPayoff,
    },
  };
}

// ─── Scenario Simulation ───

interface SimDebt {
  id: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

const MAX_MONTHS = 600; // 50 year safety cap

export function simulatePayoff(
  debts: SimDebt[],
  surplus: number,
  strategy: "minimum" | "avalanche" | "snowball"
): Omit<ScenarioResult, "label" | "strategy" | "interestSavedVsMinimum"> {
  // Deep copy
  let active = debts.map((d) => ({ ...d, balance: d.balance }));
  let totalInterest = 0;
  let month = 0;
  const timeline: { month: number; remainingBalance: number }[] = [];

  timeline.push({
    month: 0,
    remainingBalance: active.reduce((s, d) => s + d.balance, 0),
  });

  while (active.some((d) => d.balance > 0) && month < MAX_MONTHS) {
    month++;

    // 1. Accrue interest
    for (const d of active) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * (d.apr / 100)) / 12;
      totalInterest += interest;
      d.balance += interest;
    }

    // 2. Apply minimum payments
    let extraFreed = 0;
    for (const d of active) {
      if (d.balance <= 0) continue;
      const payment = Math.min(d.minimumPayment, d.balance);
      d.balance -= payment;
      if (d.balance <= 0.01) {
        // Debt paid off — freed payment rolls forward
        extraFreed += d.minimumPayment;
        d.balance = 0;
      }
    }

    // 3. Apply surplus + freed payments to target debt
    let extraPool = surplus + extraFreed;
    if (strategy === "minimum") {
      // No extra allocation beyond minimums (extraFreed still applies)
      extraPool = extraFreed;
    }

    if (extraPool > 0) {
      // Sort active debts by strategy priority
      const targets = active.filter((d) => d.balance > 0);
      if (strategy === "avalanche") {
        targets.sort((a, b) => b.apr - a.apr);
      } else {
        // snowball or minimum (freed payments go to smallest)
        targets.sort((a, b) => a.balance - b.balance);
      }

      for (const target of targets) {
        if (extraPool <= 0) break;
        const apply = Math.min(extraPool, target.balance);
        target.balance -= apply;
        extraPool -= apply;
        if (target.balance <= 0.01) target.balance = 0;
      }
    }

    timeline.push({
      month,
      remainingBalance: active.reduce((s, d) => s + Math.max(0, d.balance), 0),
    });
  }

  return {
    monthsToPayoff: month,
    totalInterestPaid: Math.round(totalInterest * 100) / 100,
    timeline,
  };
}

export function runAllScenarios(debts: DebtInput[], surplus: number): ScenarioResult[] {
  const simDebts: SimDebt[] = debts.map((d) => ({
    id: d.id,
    balance: d.balance,
    apr: d.apr,
    minimumPayment: d.minimumPayment,
  }));

  const minimum = simulatePayoff(simDebts, surplus, "minimum");
  const avalanche = simulatePayoff(simDebts, surplus, "avalanche");
  const snowball = simulatePayoff(simDebts, surplus, "snowball");

  return [
    {
      label: "Minimums Only",
      strategy: "minimum",
      ...minimum,
      interestSavedVsMinimum: 0,
    },
    {
      label: "Avalanche",
      strategy: "avalanche",
      ...avalanche,
      interestSavedVsMinimum: Math.round((minimum.totalInterestPaid - avalanche.totalInterestPaid) * 100) / 100,
    },
    {
      label: "Snowball",
      strategy: "snowball",
      ...snowball,
      interestSavedVsMinimum: Math.round((minimum.totalInterestPaid - snowball.totalInterestPaid) * 100) / 100,
    },
  ];
}

// ─── Formatting helpers ───

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCents(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (years === 0) return `${months} months`;
  if (remaining === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${remaining}mo`;
}
