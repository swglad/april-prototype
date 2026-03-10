import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { theme } from "@/theme/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Car,
  GraduationCap,
  ClipboardList,
  Calculator,
  GitFork,
  FileText,
  RefreshCw,
  ArrowRight,
  User,
} from "lucide-react";

const mayaDebts = [
  { name: "Chase Freedom Card", type: "Credit Card", balance: "$4,200", apr: "24.99%", min: "$85/mo", icon: CreditCard, iconColor: "text-primary" },
  { name: "Car Loan", type: "Auto Loan", balance: "$11,500", apr: "7.9%", min: "$245/mo", icon: Car, iconColor: "text-secondary" },
  { name: "Student Loan", type: "Student Loan", balance: "$18,000", apr: "5.8%", min: "$195/mo", icon: GraduationCap, iconColor: "text-positive" },
];

const walkthrough = [
  {
    step: 1,
    title: "Maya enters her debts.",
    icon: ClipboardList,
    copy: "Maya takes 3 minutes to gather her statements. The accuracy bar hits 100% as she fills in each field.",
    content: "debts",
  },
  {
    step: 2,
    title: "APRil shows her the real cost.",
    icon: Calculator,
    copy: "Maya didn't realize her credit card — her smallest debt — was costing her more in monthly interest than her student loan. That changes everything.",
    content: "cost",
  },
  {
    step: 3,
    title: "Three paths, her choice.",
    icon: GitFork,
    copy: "The avalanche method would save Maya $2,340 and cut 14 months off her payoff timeline. The snowball would pay off her credit card in 11 months, giving her an early win.",
    content: "scenarios",
  },
  {
    step: 4,
    title: "Her summary, in plain English.",
    icon: FileText,
    copy: "No jargon. No judgment. Just a clear, honest picture of what her money is doing — and what it could do instead.",
    content: "summary",
  },
  {
    step: 5,
    title: "She updates her numbers.",
    icon: RefreshCw,
    copy: "Three months later, Maya got a raise. She updates her surplus to $450 and sees her payoff timeline shrink by 8 more months.",
    content: "update",
  },
];

const StepDebtsMock = () => (
  <div className="mt-4 space-y-3">
    {mayaDebts.map((d) => {
      const Icon = d.icon;
      return (
        <div
          key={d.name}
          className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
          style={{ borderRadius: theme.radius.card }}
        >
          <Icon size={28} className={d.iconColor} />
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-foreground truncate">{d.name}</p>
            <p className="font-body text-xs text-muted-foreground">{d.type}</p>
          </div>
          <div className="text-right space-y-0.5 shrink-0">
            <p className="font-body text-sm font-semibold text-foreground">{d.balance}</p>
            <p className="font-body text-xs text-muted-foreground">{d.apr} · {d.min}</p>
          </div>
        </div>
      );
    })}
    <div className="flex items-center gap-2 rounded-lg bg-secondary/10 p-3" style={{ borderRadius: theme.radius.input }}>
      <span className="font-body text-xs font-semibold text-secondary">Monthly surplus:</span>
      <span className="font-body text-sm font-bold text-secondary">$300</span>
    </div>
  </div>
);

const StepCostMock = () => (
  <div className="mt-4 overflow-x-auto">
    <table className="w-full font-body text-sm">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="py-2 pr-4 font-semibold text-muted-foreground">Debt</th>
          <th className="py-2 pr-4 font-semibold text-muted-foreground text-right">Monthly Interest</th>
          <th className="py-2 font-semibold text-muted-foreground text-right">Annual Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-border/50">
          <td className="py-2 pr-4 text-foreground font-medium">
            Chase Freedom Card
            <span className="ml-2 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">Highest Impact</span>
          </td>
          <td className="py-2 pr-4 text-right text-foreground">$87.46</td>
          <td className="py-2 text-right text-foreground">$1,050</td>
        </tr>
        <tr className="border-b border-border/50">
          <td className="py-2 pr-4 text-foreground font-medium">Car Loan</td>
          <td className="py-2 pr-4 text-right text-foreground">$75.71</td>
          <td className="py-2 text-right text-foreground">$909</td>
        </tr>
        <tr>
          <td className="py-2 pr-4 text-foreground font-medium">Student Loan</td>
          <td className="py-2 pr-4 text-right text-foreground">$87.00</td>
          <td className="py-2 text-right text-foreground">$1,044</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const StepScenariosMock = () => {
  const scenarios = [
    { label: "Minimums Only", months: "78 months", interest: "$8,420", saved: "—", color: "bg-positive/15 text-positive" },
    { label: "Avalanche", months: "64 months", interest: "$6,080", saved: "$2,340", color: "bg-secondary/15 text-secondary" },
    { label: "Snowball", months: "67 months", interest: "$6,510", saved: "$1,910", color: "bg-primary/15 text-primary" },
  ];
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {scenarios.map((s) => (
        <div key={s.label} className="rounded-lg border border-border bg-background p-4 text-center" style={{ borderRadius: theme.radius.card }}>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${s.color} mb-3`}>{s.label}</span>
          <p className="font-heading text-xl font-bold text-foreground">{s.months}</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Interest: {s.interest}</p>
          {s.saved !== "—" && (
            <p className="font-body text-xs font-semibold text-secondary mt-1">Saves {s.saved}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const StepSummaryMock = () => (
  <div className="mt-4 space-y-3">
    <div className="rounded-lg bg-background border border-border p-4" style={{ borderRadius: theme.radius.card }}>
      <p className="font-body text-sm text-foreground leading-relaxed">
        "You're managing <span className="font-semibold">3 debt accounts</span> totaling <span className="font-semibold">$33,700</span>.
        Your <span className="font-semibold">Chase Freedom Card</span> is your biggest cost driver at <span className="font-semibold">24.99%</span>.
        With your <span className="font-semibold">$300/month</span> surplus, the avalanche approach could save you <span className="font-semibold">$2,340</span> in interest."
      </p>
    </div>
    <p className="font-body text-xs text-muted-foreground italic">
      No jargon. No judgment. Just clarity.
    </p>
  </div>
);

const StepUpdateMock = () => (
  <div className="mt-4 flex items-center gap-4 rounded-lg bg-secondary/10 p-4" style={{ borderRadius: theme.radius.card }}>
    <RefreshCw size={24} className="text-secondary shrink-0" />
    <div>
      <p className="font-body text-sm font-semibold text-foreground">Surplus updated: $300 → $450</p>
      <p className="font-body text-xs text-muted-foreground mt-1">Payoff timeline shrinks by 8 more months.</p>
    </div>
  </div>
);

const mockContent: Record<string, React.FC> = {
  debts: StepDebtsMock,
  cost: StepCostMock,
  scenarios: StepScenariosMock,
  summary: StepSummaryMock,
  update: StepUpdateMock,
};

const Tutorial = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            See {theme.brand.name} in action.
          </h1>
          <p className="mt-3 font-body text-lg text-muted-foreground leading-relaxed">
            Follow Maya through {theme.brand.name} — from confused to clear in under 5 minutes.
          </p>
        </div>

        {/* Persona intro card */}
        <Card
          className="mb-10 border-0 overflow-hidden"
          style={{ borderRadius: theme.radius.card, background: "hsl(var(--primary) / 0.1)" }}
        >
          <CardContent className="p-6 sm:p-8 flex items-start gap-5">
            <div className="shrink-0 w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Meet Maya.</h2>
              <p className="font-body text-base text-foreground leading-relaxed">
                She's 31, has three debts, and has been paying minimums for two years. She's not sure
                which debt to focus on — or if it even matters. Let's find out.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Walkthrough steps */}
        <div className="space-y-6">
          {walkthrough.map((step) => {
            const Icon = step.icon;
            const MockContent = mockContent[step.content];
            return (
              <Card
                key={step.step}
                className="border border-border bg-card overflow-hidden"
                style={{
                  borderRadius: theme.radius.card,
                  boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
                }}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-sm font-bold shrink-0">
                      {step.step}
                    </div>
                    <Icon size={20} className="text-muted-foreground" />
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="font-body text-base text-muted-foreground leading-relaxed">
                    {step.copy}
                  </p>
                  <MockContent />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            variant="hero"
            size="xl"
            className="font-heading text-lg gap-2 w-full sm:w-auto sm:px-12"
            onClick={() => navigate("/app")}
          >
            Ready? Start with your own numbers
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Tutorial;
