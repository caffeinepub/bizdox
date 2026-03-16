import { Badge } from "@/components/ui/badge";
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
import { Download } from "lucide-react";
import type { Payment } from "../../backend";
import { useAuthContext } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";

export default function DownloadsPage() {
  const { actor, isFetching } = useActor();
  const { userProfile } = useAuthContext();

  const { data: exports, isLoading: exportsLoading } = useQuery({
    queryKey: ["userExports", userProfile?.id?.toString()],
    queryFn: () => actor!.getExportsByUser(userProfile!.id),
    enabled: !!actor && !!userProfile && !isFetching,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["userPayments", userProfile?.id?.toString()],
    queryFn: () => actor!.getPaymentsByUser(userProfile!.id),
    enabled: !!actor && !!userProfile && !isFetching,
  });

  const isLoading = exportsLoading || paymentsLoading;

  const paymentMap = (payments || []).reduce<Record<string, Payment>>(
    (acc, p) => {
      acc[p.paymentId] = p;
      return acc;
    },
    {},
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Downloads & Exports</h2>
        <p className="text-muted-foreground text-sm">
          {exports?.length ?? 0} total downloads
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-base">Export History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div data-ocid="downloads.loading_state" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !exports?.length ? (
            <div
              data-ocid="downloads.empty_state"
              className="text-center py-12"
            >
              <Download className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No downloads yet</p>
            </div>
          ) : (
            <Table data-ocid="downloads.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Export ID</TableHead>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exp, idx) => {
                  const payment = paymentMap[exp.paymentId];
                  return (
                    <TableRow
                      key={exp.exportId}
                      data-ocid={`downloads.row.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {exp.exportId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {exp.documentId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {exp.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment ? (
                          <Badge className="bg-green-100 text-green-800">
                            ₹{Number(payment.amount)} Paid
                          </Badge>
                        ) : (
                          <Badge variant="secondary">-</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(
                          Number(exp.downloadDate) / 1_000_000,
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
