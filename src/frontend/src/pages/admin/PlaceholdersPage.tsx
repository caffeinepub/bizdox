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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Placeholder } from "../../backend";
import { useActor } from "../../hooks/useActor";

interface PhForm {
  token: string;
  fieldId: string;
  description: string;
}
const EMPTY: PhForm = { token: "", fieldId: "", description: "" };

export default function PlaceholdersPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Placeholder | null>(null);
  const [form, setForm] = useState<PhForm>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["allTemplates"],
    queryFn: () => actor!.getAllTemplates(),
    enabled: !!actor && !isFetching,
  });

  const { data: placeholders, isLoading } = useQuery({
    queryKey: ["placeholders", selectedTemplateId],
    queryFn: () => actor!.getPlaceholdersForTemplate(selectedTemplateId!),
    enabled: !!actor && !!selectedTemplateId && !isFetching,
  });

  const { data: fields } = useQuery({
    queryKey: ["templateFields", selectedTemplateId],
    queryFn: () => actor!.getFieldsForTemplate(selectedTemplateId!),
    enabled: !!actor && !!selectedTemplateId && !isFetching,
  });

  const fieldMap = (fields || []).reduce(
    (acc, f) => {
      acc[f.fieldId] = f.fieldLabel;
      return acc;
    },
    {} as Record<string, string>,
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };
  const openEdit = (p: Placeholder) => {
    setEditing(p);
    setForm({ token: p.token, fieldId: p.fieldId, description: p.description });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await actor!.updatePlaceholder(
          editing.placeholderId,
          form.token,
          form.fieldId,
          form.description,
        );
      } else {
        await actor!.createPlaceholder(
          selectedTemplateId!,
          form.token,
          form.fieldId,
          form.description,
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["placeholders"] });
      toast.success(editing ? "Placeholder updated" : "Placeholder created");
      setShowModal(false);
    },
    onError: () => toast.error("Failed to save placeholder"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deletePlaceholder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["placeholders"] });
      toast.success("Placeholder deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Placeholder Manager</h2>
        <p className="text-muted-foreground text-sm">
          Map template tokens to form fields
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={selectedTemplateId || ""}
          onValueChange={setSelectedTemplateId}
        >
          <SelectTrigger
            data-ocid="placeholders.template.select"
            className="max-w-xs"
          >
            <SelectValue placeholder="Select a template..." />
          </SelectTrigger>
          <SelectContent>
            {(templates || []).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTemplateId && (
          <Button
            data-ocid="placeholders.add.primary_button"
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Placeholder
          </Button>
        )}
      </div>

      {!selectedTemplateId ? (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Select a template to manage placeholders
          </p>
        </div>
      ) : isLoading ? (
        <div data-ocid="placeholders.loading_state" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : !placeholders?.length ? (
        <div data-ocid="placeholders.empty_state" className="text-center py-12">
          <Tag className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No placeholders yet</p>
        </div>
      ) : (
        <Table data-ocid="placeholders.table">
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Mapped Field</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(placeholders || []).map((p, idx) => (
              <TableRow
                key={p.placeholderId}
                data-ocid={`placeholders.row.${idx + 1}`}
              >
                <TableCell>
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">{`{{${p.token}}}`}</code>
                </TableCell>
                <TableCell className="text-sm">
                  {fieldMap[p.fieldId] || p.fieldId}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.description}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      data-ocid={`placeholders.edit_button.${idx + 1}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      data-ocid={`placeholders.delete_button.${idx + 1}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(p.placeholderId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-ocid="placeholders.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Edit Placeholder" : "Add Placeholder"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Token (without braces) *</Label>
              <div className="flex items-center">
                <span className="px-3 h-10 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm flex items-center">
                  {"{{"}
                </span>
                <Input
                  data-ocid="placeholders.token.input"
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                  placeholder="buyer_name"
                  className="rounded-l-none rounded-r-none border-r-0"
                />
                <span className="px-3 h-10 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm flex items-center">
                  {"}}"}
                </span>
              </div>
            </div>
            <div>
              <Label>Mapped Field *</Label>
              <Select
                value={form.fieldId}
                onValueChange={(v) => setForm({ ...form, fieldId: v })}
              >
                <SelectTrigger data-ocid="placeholders.field.select">
                  <SelectValue placeholder="Select a field..." />
                </SelectTrigger>
                <SelectContent>
                  {(fields || []).map((f) => (
                    <SelectItem key={f.fieldId} value={f.fieldId}>
                      {f.fieldLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                data-ocid="placeholders.desc.input"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What this placeholder represents"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="placeholders.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.token || !form.fieldId}
              className="bg-primary hover:bg-primary/90"
              data-ocid="placeholders.save_button"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="placeholders.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Placeholder?</AlertDialogTitle>
            <AlertDialogDescription>
              This placeholder will be removed from the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="placeholders.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="placeholders.delete.confirm_button"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
