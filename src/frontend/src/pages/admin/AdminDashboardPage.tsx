import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  DollarSign,
  Download,
  FileText,
  Users,
} from "lucide-react";
import { useActor } from "../../hooks/useActor";
import { navigate } from "../../lib/router";

export default function AdminDashboardPage() {
  const { actor, isFetching } = useActor();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => actor!.getAnalytics(),
    enabled: !!actor && !isFetching,
  });

  const stats = [
    {
      label: "Total Users",
      value: analytics ? Number(analytics.totalUsers) : 0,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Documents",
      value: analytics ? Number(analytics.totalDocuments) : 0,
      icon: FileText,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Downloads",
      value: analytics ? Number(analytics.totalDownloads) : 0,
      icon: Download,
      color: "bg-accent/10 text-yellow-600",
    },
    {
      label: "Total Revenue",
      value: analytics ? `\u20b9${Number(analytics.totalRevenue)}` : "\u20b90",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
  ];

  const shortcuts = [
    { label: "Manage Users", path: "/admin/users" },
    { label: "Templates", path: "/admin/templates" },
    { label: "Form Builder", path: "/admin/form-builder" },
    { label: "Payments", path: "/admin/payments" },
    { label: "Analytics", path: "/admin/analytics" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Platform overview and quick actions
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  )}
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {shortcuts.map(({ label, path }) => (
          <button
            key={path}
            type="button"
            data-ocid={`admin.${label.toLowerCase().replace(/ /g, "_")}.link`}
            onClick={() => navigate(path)}
            className="p-4 bg-card border border-border rounded-xl text-left hover:shadow-card hover:border-primary/30 transition-all group"
          >
            <p className="text-sm font-semibold">{label}</p>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
