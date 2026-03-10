import Layout from "@/components/Layout";
import { theme } from "@/theme/config";

const steps = [
  { number: 1, label: "Your Debts" },
  { number: 2, label: "Cost Breakdown" },
  { number: 3, label: "Repayment Scenarios" },
  { number: 4, label: "Your Summary" },
  { number: 5, label: "Update & Recalculate" },
];

const AppPage = () => {
  const currentStep = 1;

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
          {/* Track */}
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div
          className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center"
          style={{ borderRadius: theme.radius.card }}
        >
          <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {steps[currentStep - 1].label}
          </h2>
          <p className="mt-4 text-muted-foreground font-body text-lg">
            Step {currentStep} will be built next.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AppPage;
