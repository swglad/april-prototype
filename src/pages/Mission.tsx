import Layout from "@/components/Layout";
import { theme } from "@/theme/config";

const Mission = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl leading-tight">
          We built {theme.brand.name} because debt deserves honesty.
        </h1>

        <div className="mt-10 space-y-6 text-lg text-muted-foreground font-body leading-relaxed">
          <p>
            For too many people, debt is a source of shame and confusion. Lenders
            benefit from complexity — the harder it is to understand your APR, the
            longer you stay in debt. We believe transparency is the first step toward
            financial freedom, and we built {theme.brand.name} to provide exactly that.
          </p>
          <p>
            {theme.brand.name} isn't a bank, a lender, or a financial advisor. We're a
            small team of designers, engineers, and educators who believe that if you
            can see the true cost of your debt, you'll make better decisions. Our tool
            takes the math that banks use against you and puts it in your hands.
          </p>
          <p>
            We don't sell your data. We don't push products. We don't even require an
            account. {theme.brand.name} is, and always will be, a free educational tool
            — because understanding your money shouldn't cost you more of it.
          </p>
        </div>

        <blockquote className="mt-12 border-l-4 border-primary pl-6 py-2">
          <p className="font-heading text-2xl italic text-primary leading-relaxed sm:text-3xl">
            "Paying down high-interest debt is one of the best financial moves you can
            make. We just make it visible."
          </p>
        </blockquote>
      </div>
    </Layout>
  );
};

export default Mission;
