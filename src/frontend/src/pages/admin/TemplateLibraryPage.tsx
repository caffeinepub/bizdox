import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Library,
  Loader2,
  PackageCheck,
  Palette,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TemplateSeedResult } from "../../backend";
import { useActor } from "../../hooks/useActor";

const TEMPLATE_NAMES = [
  "Proforma Invoice",
  "Commercial Invoice",
  "Sales Contract",
  "Purchase Contract",
  "Packing List",
  "Commodity Specification Sheet",
  "Cashew Kernel Offer Sheet",
  "Inspection Certificate",
  "Broker Commission Agreement",
  "LC Draft",
];

const THEME_NAMES = [
  "Classic Trade",
  "Premium Export",
  "Agro Green",
  "Minimal Corporate",
  "Executive Gold",
];

export default function TemplateLibraryPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [seedResult, setSeedResult] = useState<TemplateSeedResult | null>(null);

  const { data: seedStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["seedStatus"],
    queryFn: () => actor!.getSeedStatus(),
    enabled: !!actor && !isFetching,
  });

  const seedMutation = useMutation({
    mutationFn: () => actor!.seedStandardTemplates(),
    onSuccess: (result) => {
      setSeedResult(result);
      qc.invalidateQueries({ queryKey: ["seedStatus"] });
      qc.invalidateQueries({ queryKey: ["allTemplates"] });
      qc.invalidateQueries({ queryKey: ["activeTemplates"] });
      toast.success(
        `Seeding complete! ${result.templatesCreated} templates and ${result.themesCreated} themes created.`,
      );
    },
    onError: () => toast.error("Failed to run seeder. Please try again."),
  });

  const seededNames = seedStatus?.seededTemplateNames ?? [];
  const totalTemplates = Number(seedStatus?.totalTemplates ?? 0);
  const totalThemes = Number(seedStatus?.totalThemes ?? 0);
  const allSeeded = seededNames.length >= TEMPLATE_NAMES.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Library className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold">Template Library</h2>
            <p className="text-muted-foreground text-sm">
              Seed standard agro commodity trade document templates
            </p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      {statusLoading ? (
        <div data-ocid="template-library.loading_state" className="space-y-3">
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <Card
          data-ocid="template-library.status_card"
          className="shadow-card border-border/60"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-primary" />
              Current Library Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {totalTemplates}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Templates
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {totalThemes}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Themes
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                <div className="text-2xl font-bold text-foreground">
                  {seededNames.length}/{TEMPLATE_NAMES.length}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Standard
                </div>
              </div>
            </div>

            {/* Template list */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Standard Templates
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {TEMPLATE_NAMES.map((name) => {
                  const seeded = seededNames.includes(name);
                  return (
                    <div
                      key={name}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-muted/40"
                    >
                      <FileText
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          seeded ? "text-green-600" : "text-muted-foreground/50"
                        }`}
                      />
                      <span className="text-sm flex-1 truncate">{name}</span>
                      {seeded && (
                        <Badge className="text-[10px] bg-green-100 text-green-800 border-green-200 px-1.5 py-0">
                          Seeded
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Themes preview */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Standard Themes
              </p>
              <div className="flex flex-wrap gap-2">
                {THEME_NAMES.map((name) => (
                  <Badge key={name} variant="outline" className="gap-1 text-xs">
                    <Palette className="w-3 h-3" />
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Result */}
      {seedResult && (
        <Alert
          data-ocid="template-library.success_state"
          className="border-green-200 bg-green-50 text-green-900"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="font-semibold">Seeding Successful!</AlertTitle>
          <AlertDescription>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">
                  {Number(seedResult.templatesCreated)}
                </div>
                <div className="text-xs">Templates Created</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">
                  {Number(seedResult.templatesSkipped)}
                </div>
                <div className="text-xs">Templates Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">
                  {Number(seedResult.themesCreated)}
                </div>
                <div className="text-xs">Themes Created</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">
                  {Number(seedResult.themesSkipped)}
                </div>
                <div className="text-xs">Themes Skipped</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Import Action Card */}
      <Card className="shadow-card border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-bold text-lg">
                Import Standard Templates
              </h3>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                Automatically creates{" "}
                <strong>10 professional trade document templates</strong> with
                fully structured form fields, placeholder mappings, and sample
                preview data — plus <strong>5 document themes</strong>. Safe to
                run multiple times; existing templates and themes are skipped,
                and missing fields are updated.
              </p>
              <ul className="mt-3 space-y-1">
                {[
                  "Proforma & Commercial Invoices",
                  "Sales & Purchase Contracts",
                  "Packing List & Specification Sheet",
                  "Cashew Kernel Offer Sheet & Inspection Certificate",
                  "Broker Commission Agreement & LC Draft",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {allSeeded && !seedMutation.isPending && (
                <p className="text-sm text-green-700 font-medium mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  All standard templates are already present. Running again will
                  update missing components only.
                </p>
              )}

              <div className="mt-5">
                <Button
                  data-ocid="template-library.import_button"
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending || isFetching}
                  className="bg-primary hover:bg-primary/90 gap-2 px-6"
                  size="lg"
                >
                  {seedMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing Templates...
                    </>
                  ) : (
                    <>
                      <Library className="w-4 h-4" />
                      Import Standard Templates
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {seedMutation.isPending && (
        <div
          data-ocid="template-library.loading_state"
          className="flex items-center gap-3 text-muted-foreground text-sm bg-muted/40 rounded-xl px-4 py-3"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating templates, fields, placeholders, and themes… this may take a
          few moments.
        </div>
      )}

      {seedMutation.isError && (
        <Alert data-ocid="template-library.error_state" variant="destructive">
          <AlertTitle>Seeding Failed</AlertTitle>
          <AlertDescription>
            An error occurred while importing templates. Please try again or
            contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
