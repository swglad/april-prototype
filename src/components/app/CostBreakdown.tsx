import { useMemo } from "react";
import { theme } from "@/theme/config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Handshake, Car, GraduationCap, DollarSign, TrendingUp, Clock } from "lucide-react";
import type { DebtInput } from "@/lib/debtEngine";
import {
  analyzeDebts,
  computeSummaryStats,
  formatCurrency,
  formatCurrencyCents,
} from "@/lib/debtEngine";

const typeIcons: Record<string, { icon: React.ElementType; colorClass: string }> = {
  credit_card: { icon: CreditCard, colorClass: "text-primary" },
  personal_loan: { icon: Handshake, colorClass: "text-primary" },
  auto_loan: { icon: Car, colorClass: "text-secondary" },
  student_loan: { icon: GraduationCap, colorClass: "text-positive" },
};

interface CostBreakdownProps {
  debts: DebtInput[];
}

const CostBreakdown = ({ debts }: CostBreakdownProps) => {
  const analyses = useMemo(() => analyzeDebts(debts), [debts]);
  const summary = useMemo(() => computeSummaryStats(analyses), [analyses]);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Here's where your money is going.
        </h2>
        <p className="mt-2 font-body text-base text-muted-foreground leading-relaxed max-w-2xl">
          Every month, interest charges quietly add up. Here's the full picture.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-0 overflow-hidden"
          style={{ borderRadius: theme.radius.card, background: "hsl(var(--primary) / 0.1)" }}
        >
          <CardContent className="p-5 flex items-start gap-3">
            <DollarSign size={24} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                Costing you the most
              </p>
              <p className="font-heading text-lg font-bold text-foreground mt-1">
                {summary.costliestDebt.name}
              </p>
              <p className="font-body text-sm text-primary font-semibold">
                {formatCurrencyCents(summary.costliestDebt.monthlyInterest)}/mo in interest
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 overflow-hidden"
          style={{ borderRadius: theme.radius.card, background: "hsl(var(--secondary) / 0.1)" }}
        >
          <CardContent className="p-5 flex items-start gap-3">
            <TrendingUp size={24} className="text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                Highest interest rate
              </p>
              <p className="font-heading text-lg font-bold text-foreground mt-1">
                {summary.highestAprDebt.name}
              </p>
              <p className="font-body text-sm text-secondary font-semibold">
                {summary.highestAprDebt.apr}% APR
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 overflow-hidden"
          style={{ borderRadius: theme.radius.card, background: "hsl(var(--positive) / 0.1)" }}
        >
          <CardContent className="p-5 flex items-start gap-3">
            <Clock size={24} className="text-positive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                Total interest at minimums
              </p>
              <p className="font-heading text-lg font-bold text-foreground mt-1">
                {formatCurrency(summary.totalInterestAtMinimums.amount)}
              </p>
              <p className="font-body text-sm text-positive font-semibold">
                over {summary.totalInterestAtMinimums.months} months
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranked Table */}
      <Card
        className="border border-border bg-card overflow-hidden"
        style={{
          borderRadius: theme.radius.card,
          boxShadow: "0 2px 12px 0 hsla(30, 20%, 50%, 0.08)",
        }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-body font-semibold">Debt</TableHead>
                <TableHead className="font-body font-semibold">Type</TableHead>
                <TableHead className="font-body font-semibold text-right">Balance</TableHead>
                <TableHead className="font-body font-semibold text-right">APR</TableHead>
                <TableHead className="font-body font-semibold text-right">Monthly Interest</TableHead>
                <TableHead className="font-body font-semibold text-right">Annual Cost</TableHead>
                <TableHead className="font-body font-semibold text-right">Impact Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((debt, idx) => {
                const typeConf = typeIcons[debt.type];
                const Icon = typeConf?.icon ?? CreditCard;
                return (
                  <TableRow key={debt.id}>
                    <TableCell className="font-body font-medium">
                      <div className="flex items-center gap-2">
                        {debt.nickname}
                        {idx === 0 && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                            Highest Impact
                          </Badge>
                        )}
                        {debt.promoExpiration && (
                          <Badge className="bg-positive text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                            Promo expires {debt.promoExpiration}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Icon size={16} className={typeConf?.colorClass ?? "text-muted-foreground"} />
                        <span className="font-body text-sm">
                          {debt.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-body tabular-nums">
                      {formatCurrency(debt.balance)}
                    </TableCell>
                    <TableCell className="text-right font-body tabular-nums">
                      {debt.apr}%
                    </TableCell>
                    <TableCell className="text-right font-body tabular-nums">
                      {formatCurrencyCents(debt.monthlyInterest)}
                    </TableCell>
                    <TableCell className="text-right font-body tabular-nums">
                      {formatCurrency(debt.annualInterest)}
                    </TableCell>
                    <TableCell className="text-right font-body tabular-nums font-semibold">
                      {Math.round(debt.impactScore).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default CostBreakdown;
