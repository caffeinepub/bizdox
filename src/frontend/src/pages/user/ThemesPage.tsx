import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Palette } from "lucide-react";
import { useActor } from "../../hooks/useActor";

export default function ThemesPage() {
  const { actor, isFetching } = useActor();

  const { data: themes, isLoading } = useQuery({
    queryKey: ["themes"],
    queryFn: () => actor!.getAllThemes(),
    enabled: !!actor && !isFetching,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Document Themes</h2>
        <p className="text-muted-foreground text-sm">
          Choose themes when creating documents
        </p>
      </div>

      {isLoading ? (
        <div
          data-ocid="themes.loading_state"
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : !themes?.length ? (
        <div data-ocid="themes.empty_state" className="text-center py-16">
          <Palette className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No themes available yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Themes are managed by the administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme, idx) => (
            <Card
              key={theme.themeId}
              data-ocid={`themes.item.${idx + 1}`}
              className="shadow-card hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                </div>
                <h3 className="font-semibold">{theme.themeName}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Font: {theme.fontFamily}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margins: {theme.pageMargins}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
