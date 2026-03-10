import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { theme } from "@/theme/config";
import { Link } from "react-router-dom";
import { ClipboardList, Calculator, Route } from "lucide-react";

const howItWorksSteps = [
  {
    icon: ClipboardList,
    title: "Enter Your Debts",
    description:
      "Add your credit cards, loans, and other debts in just a few minutes. We only need the basics — balance, rate, and minimum payment.",
  },
  {
    icon: Calculator,
    title: "See the Real Cost",
    description:
      "Discover how much interest you're really paying, and how long each debt will take to pay off at your current pace.",
  },
  {
    icon: Route,
    title: "Choose Your Plan",
    description:
      "Compare repayment strategies side by side. Pick the plan that fits your budget and gets you debt-free faster.",
  },
];

const trustedResources = [
  {
    name: "Consumer Financial Protection Bureau",
    url: "https://www.consumerfinance.gov",
    description: "Official U.S. government resource for consumer financial education and protection.",
  },
  {
    name: "NerdWallet",
    url: "https://www.nerdwallet.com",
    description: "Trusted comparisons and guides for credit cards, loans, and personal finance.",
  },
  {
    name: "The Financial Diet",
    url: "https://thefinancialdiet.com",
    description: "Approachable money advice for real people navigating everyday financial decisions.",
  },
  {
    name: "Khan Academy Personal Finance",
    url: "https://www.khanacademy.org/college-careers-more/personal-finance",
    description: "Free courses on interest, credit, and money management fundamentals.",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
              Your debt has a cost.{" "}
              <span className="text-primary">Now you can see it.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground font-body leading-relaxed sm:text-xl max-w-2xl">
              {theme.brand.name} turns confusing interest rates into a clear, actionable
              repayment plan — built around you, not your bank.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/app">
                <Button variant="hero" size="lg">
                  Get Started Free
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="heroOutline" size="lg">
                  See How It Works
                </Button>
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground font-body">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                No account required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                No financial advice given
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                Your data stays private
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-foreground text-center sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-center text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Three simple steps to understand and conquer your debt.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {howItWorksSteps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-border bg-background p-6 text-center"
                style={{ borderRadius: theme.radius.card }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="mb-1 text-xs font-body font-semibold text-primary uppercase tracking-wider">
                  Step {i + 1}
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground font-body leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why APRil */}
      <section className="bg-primary/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                Why {theme.brand.name}?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground font-body leading-relaxed">
                Most debt tools tell you the minimum. We show you the maximum — what
                you could save by paying smarter, not just faster.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "$8,400+", label: "Avg. interest saved" },
                { value: "4.2 yrs", label: "Faster payoff" },
                { value: "10K+", label: "Plans created" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-card border border-border p-4"
                  style={{ borderRadius: theme.radius.card }}
                >
                  <div className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground font-body">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Resources */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-foreground text-center sm:text-4xl">
            Learn More from Sources We Trust
          </h2>
          <p className="mt-3 text-center text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Reliable, independent financial education resources.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustedResources.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                style={{ borderRadius: theme.radius.card }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                  <span className="font-heading text-sm font-bold text-secondary">
                    {resource.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {resource.name}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground font-body leading-relaxed">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
