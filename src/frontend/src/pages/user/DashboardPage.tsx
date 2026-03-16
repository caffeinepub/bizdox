import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Download,
  FilePlus,
  FileStack,
  FileText,
  Plus,
} from "lucide-react";
import { Variant_generated_draft } from "../../backend";
import { useAuthContext } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { navigate } from "../../lib/router";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <Card className="shadow-card hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
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
  );
}

export default function DashboardPage() {
  const { actor, isFetching } = useActor();
  const { userProfile, principal } = useAuthContext();

  const { data: documents, isLoading: docsLoading } = useQuery({
    queryKey: ["userDocuments", principal],
    queryFn: async () => {
      if (!actor || !userProfile) return [];
      return actor.getDocumentsByUser(userProfile.id);
    },
    enabled: !!actor && !!userProfile && !isFetching,
  });

  const { data: exports, isLoading: exportsLoading } = useQuery({
    queryKey: ["userExports", principal],
    queryFn: async () => {
      if (!actor || !userProfile) return [];
      return actor.getExportsByUser(userProfile.id);
    },
    enabled: !!actor && !!userProfile && !isFetching,
  });

  const totalDocs = documents?.length ?? 0;
  const totalDownloads = exports?.length ?? 0;
  const totalDrafts =
    documents?.filter((d) => d.status === Variant_generated_draft.draft)
      .length ?? 0;

  const recentDocs = [...(documents || [])]
    .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
    .slice(0, 5);

  const statsLoading = docsLoading || exportsLoading || isFetching;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Welcome back, {userProfile?.name?.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {userProfile?.companyName} ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          data-ocid="dashboard.create.primary_button"
          onClick={() => navigate("/create")}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> New Document
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Documents Created"
          value={totalDocs}
          icon={FileText}
          color="bg-primary/10 text-primary"
          loading={statsLoading}
        />
        <StatCard
          title="Downloads"
          value={totalDownloads}
          icon={Download}
          color="bg-accent/10 text-yellow-600"
          loading={statsLoading}
        />
        <StatCard
          title="Saved Drafts"
          value={totalDrafts}
          icon={FileStack}
          color="bg-blue-50 text-blue-600"
          loading={statsLoading}
        />
        <StatCard
          title="Recent Activity"
          value={recentDocs.length}
          icon={FilePlus}
          color="bg-purple-50 text-purple-600"
          loading={statsLoading}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-serif">Recent Documents</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/documents")}
            className="gap-1 text-primary"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {docsLoading ? (
            <div
              className="space-y-3"
              data-ocid="dashboard.documents.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentDocs.length === 0 ? (
            <div
              data-ocid="dashboard.documents.empty_state"
              className="text-center py-12"
            >
              <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No documents yet.</p>
              <Button
                onClick={() => navigate("/create")}
                className="mt-4 bg-primary hover:bg-primary/90"
                size="sm"
              >
                Create your first document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocs.map((doc, idx) => (
                <div
                  key={doc.documentId}
                  data-ocid={`dashboard.documents.item.${idx + 1}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(doc.updatedAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      doc.status === Variant_generated_draft.generated
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Create Document",
            path: "/create",
            icon: FilePlus,
            desc: "Start with a template",
          },
          {
            label: "My Documents",
            path: "/documents",
            icon: FileText,
            desc: "View all documents",
          },
          {
            label: "Downloads",
            path: "/downloads",
            icon: Download,
            desc: "Export history",
          },
        ].map(({ label, path, icon: Icon, desc }) => (
          <button
            key={path}
            type="button"
            data-ocid={`dashboard.${label.toLowerCase().replace(/ /g, "_")}.card`}
            onClick={() => navigate(path)}
            className="p-4 bg-card border border-border rounded-xl text-left hover:shadow-card transition-all group"
          >
            <Icon className="w-6 h-6 text-primary mb-2" />
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
