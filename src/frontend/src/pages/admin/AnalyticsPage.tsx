import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Download,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { useActor } from "../../hooks/useActor";

export default function AnalyticsPage() {
  const { actor, isFetching } = useActor();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => actor!.getAnalytics(),
    enabled: !!actor && !isFetching,
  });

  const { data: users } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => actor!.getAllUsers(),
    enabled: !!actor && !isFetching,
  });

  const { data: payments } = useQuery({
    queryKey: ["allPayments"],
    queryFn: () => actor!.getAllPayments(),
    enabled: !!actor && !isFetching,
  });

  const stats = [
    {
      label: "Total Users",
      value: analytics ? Number(analytics.totalUsers) : 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      desc: "Registered accounts",
    },
    {
      label: "Total Documents",
      value: analytics ? Number(analytics.totalDocuments) : 0,
      icon: FileText,
      color: "bg-primary/10 text-primary",
      desc: "Documents created",
    },
    {
      label: "Total Downloads",
      value: analytics ? Number(analytics.totalDownloads) : 0,
      icon: Download,
      color: "bg-accent/10 text-yellow-600",
      desc: "Export events",
    },
    {
      label: "Total Revenue",
      value: analytics ? `\u20b9${Number(analytics.totalRevenue)}` : "\u20b90",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      desc: "from document downloads",
    },
  ];

  const recentUsers = [...(users || [])]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-serif font-bold">Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Platform performance overview
          </p>
        </div>
      </div>

      {/* Big stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, desc }) => (
          <Card key={label} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {isLoading ? (
                    <Skeleton className="h-9 w-20 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif text-base">
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recentUsers.length ? (
              <p className="text-muted-foreground text-sm">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u, idx) => (
                  <div
                    key={u.id.toString()}
                    data-ocid={`analytics.user.item.${idx + 1}`}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.companyName}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        Number(u.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif text-base">
              Revenue Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Total Payments</span>
                <span className="font-semibold">{payments?.length ?? 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm">Confirmed Payments</span>
                <span className="font-semibold text-green-700">
                  {payments?.filter((p) => p.status === "confirmed").length ??
                    0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm">Pending Payments</span>
                <span className="font-semibold text-yellow-700">
                  {payments?.filter((p) => p.status === "pending").length ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-semibold">Total Revenue</span>
                <span className="font-bold text-primary text-lg">
                  ₹{analytics ? Number(analytics.totalRevenue) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
