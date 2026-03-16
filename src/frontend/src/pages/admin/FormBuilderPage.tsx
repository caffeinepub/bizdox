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
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FormInput,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_textArea_multiSelect_numberField_textField_currency_checkbox_dateField_radio_percentage_dropdown as FieldType } from "../../backend";
import type { FormField, Template } from "../../backend";
import { useActor } from "../../hooks/useActor";

const FIELD_TYPES = [
  { value: "textField", label: "Text" },
  { value: "textArea", label: "Text Area" },
  { value: "numberField", label: "Number" },
  { value: "dateField", label: "Date" },
  { value: "dropdown", label: "Dropdown" },
  { value: "multiSelect", label: "Multi Select" },
  { value: "currency", label: "Currency" },
  { value: "percentage", label: "Percentage" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
];

interface FieldForm {
  fieldLabel: string;
  fieldPlaceholder: string;
  fieldType: string;
  required: boolean;
  optionsStr: string;
  defaultValue: string;
  order: string;
  fieldWidth: string;
  helpText: string;
  groupName: string;
  visible: boolean;
  conditionField: string;
  conditionValue: string;
}

const EMPTY_FIELD: FieldForm = {
  fieldLabel: "",
  fieldPlaceholder: "",
  fieldType: "textField",
  required: false,
  optionsStr: "",
  defaultValue: "",
  order: "1",
  fieldWidth: "100",
  helpText: "",
  groupName: "",
  visible: true,
  conditionField: "",
  conditionValue: "",
};

export default function FormBuilderPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FormField | null>(null);
  const [form, setForm] = useState<FieldForm>(EMPTY_FIELD);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["allTemplates"],
    queryFn: () => actor!.getAllTemplates(),
    enabled: !!actor && !isFetching,
  });

  const { data: fields, isLoading } = useQuery({
    queryKey: ["templateFields", selectedTemplateId],
    queryFn: () => actor!.getFieldsForTemplate(selectedTemplateId!),
    enabled: !!actor && !!selectedTemplateId && !isFetching,
  });

  const sortedFields = [...(fields || [])].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FIELD);
    setShowModal(true);
  };
  const openEdit = (f: FormField) => {
    setEditing(f);
    setForm({
      fieldLabel: f.fieldLabel,
      fieldPlaceholder: f.fieldPlaceholder,
      fieldType: f.fieldType,
      required: f.required,
      optionsStr: f.options.join(","),
      defaultValue: f.defaultValue || "",
      order: String(Number(f.order)),
      fieldWidth: String(Number(f.fieldWidth)),
      helpText: f.helpText,
      groupName: f.groupName,
      visible: f.visible,
      conditionField: f.condition?.conditionField || "",
      conditionValue: f.condition?.conditionValue || "",
    });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const opts = form.optionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const cond =
        form.conditionField && form.conditionValue
          ? {
              conditionField: form.conditionField,
              conditionValue: form.conditionValue,
            }
          : null;
      if (editing) {
        await actor!.updateFormField(
          editing.fieldId,
          form.fieldLabel,
          form.fieldPlaceholder,
          opts,
          form.required,
          form.defaultValue || null,
          BigInt(Number(form.order) || 1),
          BigInt(Number(form.fieldWidth) || 100),
          form.helpText,
          form.groupName,
          form.visible,
          cond,
        );
      } else {
        await actor!.createFormField(
          selectedTemplateId!,
          form.fieldLabel,
          form.fieldPlaceholder,
          form.fieldType,
          opts,
          form.required,
          form.defaultValue || null,
          BigInt(Number(form.order) || 1),
          BigInt(Number(form.fieldWidth) || 100),
          form.helpText,
          form.groupName,
          form.visible,
          cond,
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templateFields"] });
      toast.success(editing ? "Field updated" : "Field created");
      setShowModal(false);
    },
    onError: () => toast.error("Failed to save field"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteFormField(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templateFields"] });
      toast.success("Field deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const needsOptions = [
    FieldType.dropdown,
    FieldType.radio,
    FieldType.multiSelect,
  ].includes(form.fieldType as FieldType);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Form Builder</h2>
        <p className="text-muted-foreground text-sm">
          Add and manage form fields for templates
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={selectedTemplateId || ""}
          onValueChange={setSelectedTemplateId}
        >
          <SelectTrigger
            data-ocid="formbuilder.template.select"
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
            data-ocid="formbuilder.add_field.primary_button"
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Field
          </Button>
        )}
      </div>

      {!selectedTemplateId ? (
        <div className="text-center py-16">
          <FormInput className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Select a template to view its fields
          </p>
        </div>
      ) : isLoading ? (
        <div data-ocid="formbuilder.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !sortedFields.length ? (
        <div data-ocid="formbuilder.empty_state" className="text-center py-16">
          <FormInput className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No fields yet. Add your first field.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFields.map((field, idx) => (
            <div
              key={field.fieldId}
              data-ocid={`formbuilder.item.${idx + 1}`}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-xs"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                {Number(field.order)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{field.fieldLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {field.fieldPlaceholder}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {field.fieldType}
                </Badge>
                {field.required && (
                  <Badge className="bg-orange-100 text-orange-700 text-xs">
                    Required
                  </Badge>
                )}
                {!field.visible && (
                  <Badge variant="secondary" className="text-xs">
                    Hidden
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  data-ocid={`formbuilder.edit_button.${idx + 1}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(field)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  data-ocid={`formbuilder.delete_button.${idx + 1}`}
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteId(field.fieldId)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Field Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          data-ocid="formbuilder.dialog"
          className="max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Edit Field" : "Add Field"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Field Label *</Label>
                <Input
                  data-ocid="formbuilder.label.input"
                  value={form.fieldLabel}
                  onChange={(e) =>
                    setForm({ ...form, fieldLabel: e.target.value })
                  }
                  placeholder="e.g. Buyer Name"
                />
              </div>
              <div className="col-span-2">
                <Label>Placeholder</Label>
                <Input
                  data-ocid="formbuilder.placeholder.input"
                  value={form.fieldPlaceholder}
                  onChange={(e) =>
                    setForm({ ...form, fieldPlaceholder: e.target.value })
                  }
                  placeholder="e.g. Enter buyer name"
                />
              </div>
              {!editing && (
                <div className="col-span-2">
                  <Label>Field Type *</Label>
                  <Select
                    value={form.fieldType}
                    onValueChange={(v) => setForm({ ...form, fieldType: v })}
                  >
                    <SelectTrigger data-ocid="formbuilder.type.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {needsOptions && (
                <div className="col-span-2">
                  <Label>Options (comma-separated)</Label>
                  <Input
                    data-ocid="formbuilder.options.input"
                    value={form.optionsStr}
                    onChange={(e) =>
                      setForm({ ...form, optionsStr: e.target.value })
                    }
                    placeholder="Option A, Option B, Option C"
                  />
                </div>
              )}
              <div>
                <Label>Order</Label>
                <Input
                  data-ocid="formbuilder.order.input"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </div>
              <div>
                <Label>Width (%)</Label>
                <Select
                  value={form.fieldWidth}
                  onValueChange={(v) => setForm({ ...form, fieldWidth: v })}
                >
                  <SelectTrigger data-ocid="formbuilder.width.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Full (100%)</SelectItem>
                    <SelectItem value="50">Half (50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Default Value</Label>
                <Input
                  data-ocid="formbuilder.default.input"
                  value={form.defaultValue}
                  onChange={(e) =>
                    setForm({ ...form, defaultValue: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Help Text</Label>
                <Input
                  data-ocid="formbuilder.help.input"
                  value={form.helpText}
                  onChange={(e) =>
                    setForm({ ...form, helpText: e.target.value })
                  }
                  placeholder="Hint shown below field"
                />
              </div>
              <div>
                <Label>Group Name</Label>
                <Input
                  data-ocid="formbuilder.group.input"
                  value={form.groupName}
                  onChange={(e) =>
                    setForm({ ...form, groupName: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch
                  data-ocid="formbuilder.visible.switch"
                  checked={form.visible}
                  onCheckedChange={(v) => setForm({ ...form, visible: v })}
                />
                <Label>Visible</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  data-ocid="formbuilder.required.switch"
                  checked={form.required}
                  onCheckedChange={(v) => setForm({ ...form, required: v })}
                />
                <Label>Required</Label>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Conditional Logic (optional)
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label>If Field ID equals</Label>
                  <Input
                    data-ocid="formbuilder.cond_field.input"
                    value={form.conditionField}
                    onChange={(e) =>
                      setForm({ ...form, conditionField: e.target.value })
                    }
                    placeholder="Field ID"
                  />
                </div>
                <div>
                  <Label>Value</Label>
                  <Input
                    data-ocid="formbuilder.cond_value.input"
                    value={form.conditionValue}
                    onChange={(e) =>
                      setForm({ ...form, conditionValue: e.target.value })
                    }
                    placeholder="Condition value"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="formbuilder.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.fieldLabel}
              className="bg-primary hover:bg-primary/90"
              data-ocid="formbuilder.save_button"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editing ? "Update" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="formbuilder.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Field?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the field from the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="formbuilder.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="formbuilder.delete.confirm_button"
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
