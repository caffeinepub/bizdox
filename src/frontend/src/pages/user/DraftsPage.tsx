import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, FileStack, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Variant_generated_draft } from "../../backend";
import { useAuthContext } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { navigate } from "../../lib/router";

export default function DraftsPage() {
  const { actor, isFetching } = useActor();
  const { userProfile } = useAuthContext();
  const qc = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["userDocuments", userProfile?.id?.toString()],
    queryFn: () => actor!.getDocumentsByUser(userProfile!.id),
    enabled: !!actor && !!userProfile && !isFetching,
  });

  const drafts = (documents || []).filter(
    (d) => d.status === Variant_generated_draft.draft,
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userDocuments"] });
      toast.success("Draft deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Saved Drafts</h2>
        <p className="text-muted-foreground text-sm">
          {drafts.length} drafts saved
        </p>
      </div>

      {isLoading ? (
        <div data-ocid="drafts.loading_state" className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !drafts.length ? (
        <div data-ocid="drafts.empty_state" className="text-center py-16">
          <FileStack className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No drafts yet</p>
          <Button
            onClick={() => navigate("/create")}
            className="mt-4 bg-primary hover:bg-primary/90"
            size="sm"
          >
            Create a document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((doc, idx) => (
            <Card
              key={doc.documentId}
              data-ocid={`drafts.item.${idx + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <FileStack className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Last saved:{" "}
                      {new Date(
                        Number(doc.updatedAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    data-ocid={`drafts.delete_button.${idx + 1}`}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(doc.documentId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
