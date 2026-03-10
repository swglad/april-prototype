import Layout from "@/components/Layout";
import { theme } from "@/theme/config";
import { BookOpen } from "lucide-react";

const Tutorial = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div
          className="rounded-xl border border-border bg-card p-10 text-center"
          style={{ borderRadius: theme.radius.card }}
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Interactive Tutorial
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-body">
            Coming soon. This guided walkthrough will show you exactly how to use{" "}
            {theme.brand.name} to build your personalized repayment plan.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Tutorial;
