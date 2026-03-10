import { theme } from "@/theme/config";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CreditCard, Handshake, Car, GraduationCap, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";

export type DebtType = "credit_card" | "personal_loan" | "auto_loan" | "student_loan" | "";

export interface DebtEntry {
  id: string;
  nickname: string;
  type: DebtType;
  balance: string;
  apr: string;
  minimumPayment: string;
  promoExpiration: string;
  isExample?: boolean;
}

const debtTypeConfig: Record<string, { icon: React.ElementType; colorClass: string; label: string }> = {
  credit_card: { icon: CreditCard, label: "Credit Card", colorClass: "text-primary" },
  personal_loan: { icon: Handshake, label: "Personal Loan", colorClass: "text-primary" },
  auto_loan: { icon: Car, label: "Auto Loan", colorClass: "text-secondary" },
  student_loan: { icon: GraduationCap, label: "Student Loan", colorClass: "text-positive" },
};

interface DebtCardProps {
  debt: DebtEntry;
  index: number;
  errors: Record<string, string>;
  onChange: (id: string, field: keyof DebtEntry, value: string) => void;
  onRemove: (id: string) => void;
}

const DebtCard = ({ debt, index, errors, onChange, onRemove }: DebtCardProps) => {
  const [aprHelpOpen, setAprHelpOpen] = useState(false);
  const config = debt.type ? debtTypeConfig[debt.type] : null;
  const IconComponent = config?.icon;
  const fieldPrefix = `debt-${debt.id}`;

  return (
    <Card
      className="relative border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
      style={{
        borderRadius: theme.radius.card,
        boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
      }}
    >
      {debt.isExample && (
        <div className="bg-muted px-4 py-2 text-xs font-body italic text-muted-foreground border-b border-border">
          Example — tap to edit or remove
        </div>
      )}
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start gap-4 sm:gap-6">
          {/* Icon */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl bg-muted"
            style={{ width: 64, height: 64 }}
          >
            {IconComponent ? (
              <IconComponent size={32} className={config.colorClass} />
            ) : (
              <CreditCard size={32} className="text-muted-foreground/40" />
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Row 1: nickname + type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-nickname`} className="font-body text-sm font-medium text-foreground">
                  Debt Nickname
                </Label>
                <Input
                  id={`${fieldPrefix}-nickname`}
                  value={debt.nickname}
                  onChange={(e) => onChange(debt.id, "nickname", e.target.value)}
                  placeholder="e.g. Chase Credit Card, Car Loan, Sallie Mae"
                  className={errors[`${debt.id}-nickname`] ? "border-primary ring-primary/30" : ""}
                  style={{ borderRadius: theme.radius.input }}
                />
                {errors[`${debt.id}-nickname`] && (
                  <p className="text-xs font-body text-primary">{errors[`${debt.id}-nickname`]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-type`} className="font-body text-sm font-medium text-foreground">
                  Debt Type
                </Label>
                <Select
                  value={debt.type}
                  onValueChange={(val) => onChange(debt.id, "type", val)}
                >
                  <SelectTrigger
                    id={`${fieldPrefix}-type`}
                    className={errors[`${debt.id}-type`] ? "border-primary ring-primary/30" : ""}
                    style={{ borderRadius: theme.radius.input }}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="personal_loan">Personal Loan</SelectItem>
                    <SelectItem value="auto_loan">Auto Loan</SelectItem>
                    <SelectItem value="student_loan">Student Loan</SelectItem>
                  </SelectContent>
                </Select>
                {errors[`${debt.id}-type`] && (
                  <p className="text-xs font-body text-primary">{errors[`${debt.id}-type`]}</p>
                )}
              </div>
            </div>

            {/* Row 2: balance + APR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-balance`} className="font-body text-sm font-medium text-foreground">
                  Current Balance ($)
                </Label>
                <Input
                  id={`${fieldPrefix}-balance`}
                  value={debt.balance}
                  onChange={(e) => onChange(debt.id, "balance", e.target.value)}
                  placeholder="e.g. $8,500"
                  className={errors[`${debt.id}-balance`] ? "border-primary ring-primary/30" : ""}
                  style={{ borderRadius: theme.radius.input }}
                />
                {errors[`${debt.id}-balance`] && (
                  <p className="text-xs font-body text-primary">{errors[`${debt.id}-balance`]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-apr`} className="font-body text-sm font-medium text-foreground">
                  APR (%)
                </Label>
                <Input
                  id={`${fieldPrefix}-apr`}
                  value={debt.apr}
                  onChange={(e) => onChange(debt.id, "apr", e.target.value)}
                  placeholder="e.g. 22.99 — check your statement or online account"
                  className={errors[`${debt.id}-apr`] ? "border-primary ring-primary/30" : ""}
                  style={{ borderRadius: theme.radius.input }}
                />
                {errors[`${debt.id}-apr`] && (
                  <p className="text-xs font-body text-primary">{errors[`${debt.id}-apr`]}</p>
                )}

                {/* APR helper */}
                <Collapsible open={aprHelpOpen} onOpenChange={setAprHelpOpen}>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs font-body text-secondary hover:text-secondary/80 transition-colors cursor-pointer mt-1">
                    Where do I find my APR?
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${aprHelpOpen ? "rotate-180" : ""}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 text-xs font-body text-muted-foreground bg-muted rounded-lg p-3" style={{ borderRadius: theme.radius.input }}>
                    Check your most recent statement, your lender's app or website, or call the number on the back of your card.
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            {/* Row 3: min payment + promo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-min`} className="font-body text-sm font-medium text-foreground">
                  Minimum Monthly Payment ($)
                </Label>
                <Input
                  id={`${fieldPrefix}-min`}
                  value={debt.minimumPayment}
                  onChange={(e) => onChange(debt.id, "minimumPayment", e.target.value)}
                  placeholder="e.g. $185 — the required minimum, not what you actually pay"
                  className={errors[`${debt.id}-minimumPayment`] ? "border-primary ring-primary/30" : ""}
                  style={{ borderRadius: theme.radius.input }}
                />
                {errors[`${debt.id}-minimumPayment`] && (
                  <p className="text-xs font-body text-primary">{errors[`${debt.id}-minimumPayment`]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldPrefix}-promo`} className="font-body text-sm font-medium text-foreground">
                  Promo Rate Expiration <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id={`${fieldPrefix}-promo`}
                  value={debt.promoExpiration}
                  onChange={(e) => onChange(debt.id, "promoExpiration", e.target.value)}
                  placeholder="Only if you have a 0% intro rate ending soon"
                  style={{ borderRadius: theme.radius.input }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remove button */}
        <div className="flex justify-end mt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(debt.id)}
            className="text-muted-foreground hover:text-primary"
          >
            <Trash2 size={16} />
            <span className="ml-1">Remove</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtCard;
