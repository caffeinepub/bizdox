import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Variant_textArea_multiSelect_numberField_textField_currency_checkbox_dateField_radio_percentage_dropdown as FieldType,
  Variant_generated_draft,
} from "../../backend";
import type { FormField, Template, Theme } from "../../backend";
import DocumentPreviewRenderer from "../../components/DocumentPreviewRenderer";
import PaymentModal from "../../components/PaymentModal";
import { useActor } from "../../hooks/useActor";
import type { DocField } from "../../lib/documentGenerator";

const STEPS = [
  "Select Template",
  "Fill Form",
  "Choose Theme",
  "Preview & Generate",
];

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={STEPS[i]} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              i < step
                ? "bg-primary text-primary-foreground"
                : i === step
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span
            className={`text-sm hidden sm:block ${
              i === step
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {STEPS[i]}
          </span>
          {i < total - 1 && (
            <div
              className={`w-6 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateDocumentPage() {
  const { actor, isFetching } = useActor();
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [documentTitle, setDocumentTitle] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{
    format: "pdf" | "docx" | "xlsx";
  } | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["activeTemplates"],
    queryFn: () => actor!.getActiveTemplates(),
    enabled: !!actor && !isFetching,
  });

  const { data: fields } = useQuery({
    queryKey: ["templateFields", selectedTemplate?.id],
    queryFn: () => actor!.getFieldsForTemplate(selectedTemplate!.id),
    enabled: !!actor && !!selectedTemplate && !isFetching,
  });

  const { data: themes } = useQuery({
    queryKey: ["themes"],
    queryFn: () => actor!.getAllThemes(),
    enabled: !!actor && !isFetching,
  });

  const saveMutation = useMutation({
    mutationFn: async (status: Variant_generated_draft) => {
      if (!actor || !selectedTemplate) throw new Error("Not ready");
      const themeId = selectedTheme?.themeId || "";
      let docId = documentId;
      if (!docId) {
        const doc = await actor.createDocument(
          selectedTemplate.id,
          documentTitle,
          themeId,
        );
        docId = doc.documentId;
        setDocumentId(docId);
      }
      await Promise.all(
        Object.entries(fieldValues).map(([fId, val]) =>
          actor.saveDocumentData(docId!, fId, val),
        ),
      );
      await actor.updateDocument(docId, documentTitle, themeId, status);
      return docId;
    },
  });

  useEffect(() => {
    if (fields) {
      const defaults: Record<string, string> = {};
      for (const f of fields) {
        if (f.defaultValue) defaults[f.fieldId] = f.defaultValue;
      }
      setFieldValues((prev) => ({ ...defaults, ...prev }));
    }
  }, [fields]);

  const isFieldVisible = (field: FormField) => {
    if (!field.condition) return true;
    const { conditionField, conditionValue } = field.condition;
    return fieldValues[conditionField] === conditionValue;
  };

  const sortedFields = [...(fields || [])].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );
  const visibleFields = sortedFields.filter(
    (f) => f.visible && isFieldVisible(f),
  );

  const getPreviewFields = (): DocField[] => {
    return visibleFields.map((f) => ({
      label: f.fieldLabel,
      value: fieldValues[f.fieldId] || f.defaultValue || "-",
    }));
  };

  const grouped = (templates || []).reduce(
    (acc, t) => {
      const key = t.commodityType || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    },
    {} as Record<string, Template[]>,
  );

  const renderField = (field: FormField) => {
    const val = fieldValues[field.fieldId] || "";
    const set = (v: string) =>
      setFieldValues((prev) => ({ ...prev, [field.fieldId]: v }));
    const half = Number(field.fieldWidth) === 50;

    const inner = (() => {
      switch (field.fieldType) {
        case FieldType.textArea:
          return (
            <Textarea
              data-ocid="create.field.textarea"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={field.fieldPlaceholder}
              rows={3}
            />
          );
        case FieldType.numberField:
          return (
            <Input
              data-ocid="create.field.input"
              type="number"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={field.fieldPlaceholder}
            />
          );
        case FieldType.dateField:
          return (
            <Input
              data-ocid="create.field.input"
              type="date"
              value={val}
              onChange={(e) => set(e.target.value)}
            />
          );
        case FieldType.dropdown:
          return (
            <Select value={val} onValueChange={set}>
              <SelectTrigger data-ocid="create.field.select">
                <SelectValue
                  placeholder={field.fieldPlaceholder || "Select..."}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case FieldType.currency:
          return (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                data-ocid="create.field.input"
                className="pl-7"
                type="number"
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder="0.00"
              />
            </div>
          );
        case FieldType.percentage:
          return (
            <div className="relative">
              <Input
                data-ocid="create.field.input"
                className="pr-8"
                type="number"
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          );
        case FieldType.checkbox:
          return (
            <div className="flex items-center gap-2">
              <Checkbox
                data-ocid="create.field.checkbox"
                id={field.fieldId}
                checked={val === "true"}
                onCheckedChange={(c) => set(c ? "true" : "false")}
              />
              <label htmlFor={field.fieldId} className="text-sm">
                {field.helpText || field.fieldLabel}
              </label>
            </div>
          );
        case FieldType.radio:
          return (
            <RadioGroup
              value={val}
              onValueChange={set}
              className="flex flex-wrap gap-3"
            >
              {field.options.map((opt) => (
                <div key={opt} className="flex items-center gap-1.5">
                  <RadioGroupItem value={opt} id={`${field.fieldId}-${opt}`} />
                  <label
                    htmlFor={`${field.fieldId}-${opt}`}
                    className="text-sm"
                  >
                    {opt}
                  </label>
                </div>
              ))}
            </RadioGroup>
          );
        case FieldType.multiSelect:
          return (
            <div className="flex flex-wrap gap-2">
              {field.options.map((opt) => {
                const selected = val.split(",").filter(Boolean).includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      const current = val.split(",").filter(Boolean);
                      const next = selected
                        ? current.filter((v) => v !== opt)
                        : [...current, opt];
                      set(next.join(","));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      selected
                        ? "bg-primary text-white border-primary"
                        : "bg-card border-border hover:border-primary"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          );
        default:
          return (
            <Input
              data-ocid="create.field.input"
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={field.fieldPlaceholder}
            />
          );
      }
    })();

    return (
      <div key={field.fieldId} className={half ? "col-span-1" : "col-span-2"}>
        <Label className="mb-1 block">
          {field.fieldLabel}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {inner}
        {field.helpText && (
          <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
        )}
      </div>
    );
  };

  const handleGenerate = async (status: Variant_generated_draft) => {
    if (!documentTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    try {
      await saveMutation.mutateAsync(status);
      const label =
        status === Variant_generated_draft.draft
          ? "Draft saved!"
          : "Document generated!";
      toast.success(label);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save document");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <StepIndicator step={step} total={STEPS.length} />

      {step === 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif">Select a Template</CardTitle>
          </CardHeader>
          <CardContent>
            {!templates?.length ? (
              <div
                data-ocid="create.templates.empty_state"
                className="text-center py-12"
              >
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No active templates available.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([commodity, temps]) => (
                  <div key={commodity}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {commodity}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {temps.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          data-ocid="create.template.card"
                          onClick={() => {
                            setSelectedTemplate(t);
                            setDocumentTitle(t.name);
                          }}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            selectedTemplate?.id === t.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm">{t.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {t.category}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs flex-shrink-0"
                            >
                              {t.commodityType}
                            </Badge>
                          </div>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {t.description}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif">Fill Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Document Title *</Label>
              <Input
                data-ocid="create.title.input"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            {visibleFields.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                No fields configured for this template.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {visibleFields.map(renderField)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif">Choose a Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTheme(null)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  !selectedTheme
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <div className="w-4 h-4 rounded-full bg-secondary" />
                </div>
                <p className="font-semibold text-sm">
                  Default (BizDox Classic)
                </p>
                <p className="text-xs text-muted-foreground">
                  Inter · Green & Gold
                </p>
              </button>
              {(themes || []).map((theme) => (
                <button
                  key={theme.themeId}
                  type="button"
                  data-ocid="create.theme.card"
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTheme?.themeId === theme.themeId
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                  </div>
                  <p className="font-semibold text-sm">{theme.themeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {theme.fontFamily}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-serif">Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border border-border rounded-xl p-6 shadow-inner overflow-x-auto">
                <div className="mb-4 pb-3 border-b border-border/60">
                  <h3 className="text-lg font-serif font-bold text-primary">
                    {documentTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Generated: {new Date().toLocaleDateString("en-IN")} ·
                    Template: {selectedTemplate?.name} · Theme:{" "}
                    {selectedTheme?.themeName || "Default"}
                  </p>
                </div>
                <DocumentPreviewRenderer
                  templateName={selectedTemplate?.name ?? documentTitle}
                  fieldValues={fieldValues}
                  fields={sortedFields}
                  theme={selectedTheme}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              data-ocid="create.save_draft.button"
              variant="outline"
              onClick={() => handleGenerate(Variant_generated_draft.draft)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save as Draft
            </Button>
            <Button
              data-ocid="create.generate.primary_button"
              onClick={() => handleGenerate(Variant_generated_draft.generated)}
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Generate Document
            </Button>
          </div>

          {documentId && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-serif text-base">
                  Download Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {(["pdf", "docx", "xlsx"] as const).map((fmt) => (
                    <Button
                      key={fmt}
                      data-ocid={`create.download_${fmt}.button`}
                      variant="outline"
                      onClick={() => setPayModal({ format: fmt })}
                      className="gap-2 uppercase text-xs font-semibold"
                    >
                      ↓ {fmt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button
          data-ocid="create.back.button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {step < STEPS.length - 1 && (
          <Button
            data-ocid="create.next.button"
            onClick={() => {
              if (step === 0 && !selectedTemplate) {
                toast.error("Please select a template");
                return;
              }
              setStep((s) => s + 1);
            }}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {payModal && documentId && (
        <PaymentModal
          open={!!payModal}
          onClose={() => setPayModal(null)}
          documentId={documentId}
          documentTitle={documentTitle}
          format={payModal.format}
          fields={getPreviewFields()}
          theme={selectedTheme || undefined}
        />
      )}
    </div>
  );
}
