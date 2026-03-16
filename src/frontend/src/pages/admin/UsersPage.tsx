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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff, Users } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "../../backend";
import type { UserProfile } from "../../backend";
import { useActor } from "../../hooks/useActor";

export default function UsersPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => actor!.getAllUsers(),
    enabled: !!actor && !isFetching,
  });

  const promoteMutation = useMutation({
    mutationFn: (user: UserProfile) => actor!.promoteToAdmin(user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("User promoted to admin");
    },
    onError: () => toast.error("Failed to promote user"),
  });

  const demoteMutation = useMutation({
    mutationFn: (user: UserProfile) => actor!.demoteToUser(user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("User demoted");
    },
    onError: () => toast.error("Failed to demote user"),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">User Management</h2>
        <p className="text-muted-foreground text-sm">
          {users?.length ?? 0} registered users
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <Users className="w-5 h-5" /> All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div data-ocid="users.loading_state" className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !users?.length ? (
            <div data-ocid="users.empty_state" className="text-center py-12">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground">No users registered yet</p>
            </div>
          ) : (
            <Table data-ocid="users.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow
                    key={user.id.toString()}
                    data-ocid={`users.row.${idx + 1}`}
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm">
                      {user.companyName}
                    </TableCell>
                    <TableCell className="text-sm">{user.country}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === UserRole.admin
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(
                        Number(user.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.role === UserRole.admin ? (
                        <Button
                          data-ocid={`users.demote_button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() => demoteMutation.mutate(user)}
                          disabled={demoteMutation.isPending}
                          className="gap-1 text-xs"
                        >
                          <ShieldOff className="w-3.5 h-3.5" /> Demote
                        </Button>
                      ) : (
                        <Button
                          data-ocid={`users.promote_button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() => promoteMutation.mutate(user)}
                          disabled={promoteMutation.isPending}
                          className="gap-1 text-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Promote
                        </Button>
                      )}
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
