import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { theme } from "@/theme/config";

interface ReferralScreenProps {
  onUpdateEntries: () => void;
}

const ReferralScreen = ({ onUpdateEntries }: ReferralScreenProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] print:hidden">
      <Card
        className="max-w-2xl w-full border-0 overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          background: "hsl(var(--background))",
          borderTop: "4px solid hsl(var(--primary))",
          boxShadow: "0 4px 24px 0 hsla(30, 20%, 50%, 0.12)",
        }}
      >
        <CardContent className="p-8 sm:p-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6">
            A note before we continue
          </h2>

          <div className="space-y-4 font-body text-base text-foreground leading-relaxed">
            <p>
              Based on the details you've entered, your debt picture may benefit from more
              personalized attention than a self-serve tool can provide. You may wish to consult
              a licensed financial professional to discuss your situation in greater detail.
            </p>
            <p>
              APRil is designed as an educational tool for everyday debt management — it works
              best for debt portfolios that can be addressed through structured repayment over a
              manageable timeframe. For situations of greater complexity or scale, a qualified
              advisor can offer guidance tailored to your full financial picture.
            </p>
            <p>
              Note: this is for educational purposes only and is not financial advice or a
              recommendation of any kind.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={onUpdateEntries}
              className="w-full sm:w-auto border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-body font-semibold"
            >
              Update my entries
            </Button>
            <a
              href="https://www.nfcc.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              Find a nonprofit credit counselor
            </a>
          </div>

          <p className="mt-8 font-body text-xs italic text-muted-foreground">
            Not sure if this applies to you? If you believe your entries contain a data entry
            error, click "Update my entries" to review them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralScreen;
