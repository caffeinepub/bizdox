import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_generated_draft } from "../../backend";
import PaymentModal from "../../components/PaymentModal";
import { useAuthContext } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import type { DocField } from "../../lib/documentGenerator";
import { navigate } from "../../lib/router";

export default function MyDocumentsPage() {
  const { actor, isFetching } = useActor();
  const { userProfile } = useAuthContext();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{
    docId: string;
    title: string;
    format: "pdf" | "docx" | "xlsx";
    fields: DocField[];
  } | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["userDocuments", userProfile?.id?.toString()],
    queryFn: async () => {
      if (!actor || !userProfile) return [];
      return actor.getDocumentsByUser(userProfile.id);
    },
    enabled: !!actor && !!userProfile && !isFetching,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await actor!.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });
      toast.success("Document deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete document"),
  });

  const handleDownload = async (
    docId: string,
    title: string,
    format: "pdf" | "docx" | "xlsx",
  ) => {
    if (!actor) return;
    const data = await actor.getDocumentData(docId);
    const fields: DocField[] = data.map((d) => ({
      label: d.fieldId,
      value: d.value,
    }));
    setPayModal({ docId, title, format, fields });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">My Documents</h2>
          <p className="text-muted-foreground text-sm">
            {documents?.length ?? 0} documents
          </p>
        </div>
        <Button
          data-ocid="documents.create.primary_button"
          onClick={() => navigate("/create")}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> New Document
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="documents.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !documents?.length ? (
        <div data-ocid="documents.empty_state" className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No documents yet</p>
          <Button
            onClick={() => navigate("/create")}
            className="mt-4 bg-primary hover:bg-primary/90"
            size="sm"
          >
            Create your first document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <Card
              key={doc.documentId}
              data-ocid={`documents.item.${idx + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(
                        Number(doc.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </p>
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
                  <div className="flex gap-2">
                    {doc.status === Variant_generated_draft.generated && (
                      <>
                        <Button
                          data-ocid={`documents.download_pdf.button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(doc.documentId, doc.title, "pdf")
                          }
                          className="gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </Button>
                        <Button
                          data-ocid={`documents.download_docx.button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(doc.documentId, doc.title, "docx")
                          }
                        >
                          DOCX
                        </Button>
                        <Button
                          data-ocid={`documents.download_xlsx.button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(doc.documentId, doc.title, "xlsx")
                          }
                        >
                          XLSX
                        </Button>
                      </>
                    )}
                    <Button
                      data-ocid={`documents.delete_button.${idx + 1}`}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(doc.documentId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="documents.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="documents.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="documents.delete.confirm_button"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {payModal && (
        <PaymentModal
          open={!!payModal}
          onClose={() => setPayModal(null)}
          documentId={payModal.docId}
          documentTitle={payModal.title}
          format={payModal.format}
          fields={payModal.fields}
        />
      )}
    </div>
  );
}
