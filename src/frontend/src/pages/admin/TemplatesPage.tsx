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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Template } from "../../backend";
import { useActor } from "../../hooks/useActor";

const CATEGORIES = [
  "Invoice",
  "Contract",
  "Certificate",
  "Specification",
  "Agreement",
  "Offer Sheet",
  "Other",
];
const COMMODITIES = [
  "Raw Cashew Nuts (RCN)",
  "Cashew Kernels",
  "Rice",
  "Sesame",
  "Spices",
  "Pulses",
  "Edible Oils",
  "General Agro",
];

interface TplForm {
  name: string;
  category: string;
  commodityType: string;
  description: string;
  status: boolean;
}

const EMPTY: TplForm = {
  name: "",
  category: "Contract",
  commodityType: "General Agro",
  description: "",
  status: true,
};

export default function TemplatesPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<TplForm>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["allTemplates"],
    queryFn: () => actor!.getAllTemplates(),
    enabled: !!actor && !isFetching,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };
  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({
      name: t.name,
      category: t.category,
      commodityType: t.commodityType,
      description: t.description,
      status: t.status,
    });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await actor!.updateTemplate(
          editing.id,
          form.name,
          form.category,
          form.commodityType,
          form.description,
          form.status,
        );
      } else {
        await actor!.createTemplate(
          form.name,
          form.category,
          form.commodityType,
          form.description,
          form.status,
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTemplates"] });
      qc.invalidateQueries({ queryKey: ["activeTemplates"] });
      toast.success(editing ? "Template updated" : "Template created");
      setShowModal(false);
    },
    onError: () => toast.error("Failed to save template"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTemplates"] });
      toast.success("Template deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Templates</h2>
          <p className="text-muted-foreground text-sm">
            {templates?.length ?? 0} templates
          </p>
        </div>
        <Button
          data-ocid="templates.create.primary_button"
          onClick={openCreate}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      {isLoading ? (
        <div data-ocid="templates.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !templates?.length ? (
        <div data-ocid="templates.empty_state" className="text-center py-16">
          <LayoutTemplate className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No templates yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t, idx) => (
            <Card
              key={t.id}
              data-ocid={`templates.item.${idx + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{t.name}</h3>
                      <Badge
                        variant={t.status ? "default" : "secondary"}
                        className={
                          t.status
                            ? "bg-green-100 text-green-800 text-xs"
                            : "text-xs"
                        }
                      >
                        {t.status ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.category} · {t.commodityType}
                    </p>
                    {t.description && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    data-ocid={`templates.edit_button.${idx + 1}`}
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(t)}
                    className="gap-1 text-xs"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    data-ocid={`templates.delete_button.${idx + 1}`}
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(t.id)}
                    className="gap-1 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-ocid="templates.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name *</Label>
              <Input
                data-ocid="templates.name.input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. RCN Export Contract"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger data-ocid="templates.category.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commodity</Label>
                <Select
                  value={form.commodityType}
                  onValueChange={(v) => setForm({ ...form, commodityType: v })}
                >
                  <SelectTrigger data-ocid="templates.commodity.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMODITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                data-ocid="templates.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="templates.status.switch"
                checked={form.status}
                onCheckedChange={(v) => setForm({ ...form, status: v })}
              />
              <Label>Active (visible to users)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="templates.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name}
              className="bg-primary hover:bg-primary/90"
              data-ocid="templates.save_button"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="templates.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the template and all its fields.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="templates.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="templates.delete.confirm_button"
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
