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
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Palette, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Theme } from "../../backend";
import { useActor } from "../../hooks/useActor";

const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Georgia",
  "Arial",
  "Times New Roman",
];
const HEADER_DESIGNS = ["Standard", "Minimal", "Bold", "Gradient", "Classic"];
const FOOTER_STYLES = ["Simple", "Detailed", "Logo", "None"];
const MARGINS = ["Normal (25mm)", "Wide (30mm)", "Narrow (15mm)", "Custom"];

interface ThemeForm {
  themeName: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  headerDesign: string;
  footerStyle: string;
  tableBorders: boolean;
  pageMargins: string;
}
const EMPTY: ThemeForm = {
  themeName: "",
  fontFamily: "Inter",
  primaryColor: "#1F6F43",
  secondaryColor: "#C9A227",
  headerDesign: "Standard",
  footerStyle: "Simple",
  tableBorders: true,
  pageMargins: "Normal (25mm)",
};

export default function ThemeManagerPage() {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Theme | null>(null);
  const [form, setForm] = useState<ThemeForm>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: themes, isLoading } = useQuery({
    queryKey: ["themes"],
    queryFn: () => actor!.getAllThemes(),
    enabled: !!actor && !isFetching,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };
  const openEdit = (t: Theme) => {
    setEditing(t);
    setForm({
      themeName: t.themeName,
      fontFamily: t.fontFamily,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      headerDesign: t.headerDesign,
      footerStyle: t.footerStyle,
      tableBorders: t.tableBorders,
      pageMargins: t.pageMargins,
    });
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await actor!.updateTheme(
          editing.themeId,
          form.themeName,
          form.fontFamily,
          form.primaryColor,
          form.secondaryColor,
          form.headerDesign,
          form.footerStyle,
          form.tableBorders,
          form.pageMargins,
        );
      } else {
        await actor!.createTheme(
          form.themeName,
          form.fontFamily,
          form.primaryColor,
          form.secondaryColor,
          form.headerDesign,
          form.footerStyle,
          form.tableBorders,
          form.pageMargins,
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["themes"] });
      toast.success(editing ? "Theme updated" : "Theme created");
      setShowModal(false);
    },
    onError: () => toast.error("Failed to save theme"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteTheme(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["themes"] });
      toast.success("Theme deleted");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete theme"),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Theme Manager</h2>
          <p className="text-muted-foreground text-sm">
            {themes?.length ?? 0} themes
          </p>
        </div>
        <Button
          data-ocid="themes_admin.create.primary_button"
          onClick={openCreate}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" /> New Theme
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : !themes?.length ? (
        <div data-ocid="themes_admin.empty_state" className="text-center py-16">
          <Palette className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No themes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme, idx) => (
            <Card
              key={theme.themeId}
              data-ocid={`themes_admin.item.${idx + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-5">
                <div className="flex gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                </div>
                <h3 className="font-semibold">{theme.themeName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Font: {theme.fontFamily}
                </p>
                <p className="text-xs text-muted-foreground">
                  Header: {theme.headerDesign} · Footer: {theme.footerStyle}
                </p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    data-ocid={`themes_admin.edit_button.${idx + 1}`}
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(theme)}
                    className="gap-1 text-xs"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    data-ocid={`themes_admin.delete_button.${idx + 1}`}
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteId(theme.themeId)}
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent data-ocid="themes_admin.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Edit Theme" : "New Theme"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Theme Name *</Label>
              <Input
                data-ocid="themes_admin.name.input"
                value={form.themeName}
                onChange={(e) =>
                  setForm({ ...form, themeName: e.target.value })
                }
                placeholder="e.g. Agro Green"
              />
            </div>
            <div>
              <Label>Font Family</Label>
              <Select
                value={form.fontFamily}
                onValueChange={(v) => setForm({ ...form, fontFamily: v })}
              >
                <SelectTrigger data-ocid="themes_admin.font.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm({ ...form, primaryColor: e.target.value })
                    }
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    data-ocid="themes_admin.primary_color.input"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm({ ...form, primaryColor: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) =>
                      setForm({ ...form, secondaryColor: e.target.value })
                    }
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    data-ocid="themes_admin.secondary_color.input"
                    value={form.secondaryColor}
                    onChange={(e) =>
                      setForm({ ...form, secondaryColor: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Header Design</Label>
                <Select
                  value={form.headerDesign}
                  onValueChange={(v) => setForm({ ...form, headerDesign: v })}
                >
                  <SelectTrigger data-ocid="themes_admin.header.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEADER_DESIGNS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Footer Style</Label>
                <Select
                  value={form.footerStyle}
                  onValueChange={(v) => setForm({ ...form, footerStyle: v })}
                >
                  <SelectTrigger data-ocid="themes_admin.footer.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOTER_STYLES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Page Margins</Label>
              <Select
                value={form.pageMargins}
                onValueChange={(v) => setForm({ ...form, pageMargins: v })}
              >
                <SelectTrigger data-ocid="themes_admin.margins.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARGINS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="themes_admin.borders.switch"
                checked={form.tableBorders}
                onCheckedChange={(v) => setForm({ ...form, tableBorders: v })}
              />
              <Label>Table Borders</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="themes_admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.themeName}
              className="bg-primary hover:bg-primary/90"
              data-ocid="themes_admin.save_button"
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
        <AlertDialogContent data-ocid="themes_admin.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme?</AlertDialogTitle>
            <AlertDialogDescription>
              This theme will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="themes_admin.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="themes_admin.delete.confirm_button"
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
