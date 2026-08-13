import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/lexpdf/AppHeader";
import { eliminarDocumento, listarDocumentos } from "@/lib/documents.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/historial")({
  head: () => ({
    meta: [
      { title: "Historial de documentos — LexPDF" },
      {
        name: "description",
        content: "Consulta y reabre los documentos jurídicos que has analizado con LexPDF.",
      },
      { property: "og:title", content: "Historial de documentos — LexPDF" },
      {
        property: "og:description",
        content: "Tus análisis jurídicos guardados, siempre disponibles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Historial,
});

function Historial() {
  const listar = useServerFn(listarDocumentos);
  const borrar = useServerFn(eliminarDocumento);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["documentos"],
    queryFn: () => listar({ data: undefined }),
  });

  const eliminar = async (id: string) => {
    try {
      await borrar({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast.success("Documento eliminado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Historial de documentos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aquí se guardan todos los documentos que analizas con tu cuenta.
        </p>

        <div className="mt-6 space-y-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </div>
          )}

          {!isLoading && (data?.length ?? 0) === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              Aún no has analizado ningún documento.
              <div className="mt-4">
                <Button onClick={() => navigate({ to: "/" })}>Analizar un PDF</Button>
              </div>
            </div>
          )}

          {data?.map((doc) => (
            <article
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-panel"
            >
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{doc.archivo}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.created_at).toLocaleString("es-MX")} · {doc.jurisdiccion}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/", search: { doc: doc.id } })}
              >
                Abrir
              </Button>
              <button
                type="button"
                aria-label="Eliminar documento"
                onClick={() => eliminar(doc.id)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
