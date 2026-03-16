import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { Variant_pending_confirmed } from "../../backend";
import { useActor } from "../../hooks/useActor";

export default function PaymentsPage() {
  const { actor, isFetching } = useActor();
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["allPayments"],
    queryFn: () => actor!.getAllPayments(),
    enabled: !!actor && !isFetching,
  });

  const filtered = (payments || []).filter((p) => {
    if (filter === "all") return true;
    return (
      p.status ===
      (filter === "confirmed"
        ? Variant_pending_confirmed.confirmed
        : Variant_pending_confirmed.pending)
    );
  });

  const totalRevenue = (payments || [])
    .filter((p) => p.status === Variant_pending_confirmed.confirmed)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Payment Records</h2>
          <p className="text-muted-foreground text-sm">
            {payments?.length ?? 0} transactions · ₹{totalRevenue} total revenue
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2" data-ocid="payments.filter.tab">
        {(["all", "pending", "confirmed"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className={filter === f ? "bg-primary hover:bg-primary/90" : ""}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div data-ocid="payments.loading_state" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !filtered.length ? (
            <div data-ocid="payments.empty_state" className="text-center py-12">
              <CreditCard className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <Table data-ocid="payments.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, idx) => (
                  <TableRow
                    key={p.paymentId}
                    data-ocid={`payments.row.${idx + 1}`}
                  >
                    <TableCell className="font-mono text-xs">
                      {p.paymentId.slice(0, 10)}...
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.documentId.slice(0, 10)}...
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{Number(p.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.transactionId || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.status === Variant_pending_confirmed.confirmed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(
                        Number(p.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
