import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { UploadPanel } from "@/components/lexpdf/UploadPanel";
import { AnalysisView } from "@/components/lexpdf/AnalysisView";
import { ChatPanel } from "@/components/lexpdf/ChatPanel";
import { AppHeader } from "@/components/lexpdf/AppHeader";
import type { DocumentAnalysis } from "@/lib/analysis-types";
import { analizarDocumento } from "@/lib/ai.functions";
import { guardarDocumento, obtenerDocumento } from "@/lib/documents.functions";
import { extraerTextoPdf, recortar } from "@/lib/pdf-text";
import { DEFAULT_JURISDICTION, type JurisdictionId } from "@/lib/jurisdictions";
import { useSesion } from "@/hooks/useSesion";
import { usePlan } from "@/hooks/usePlan";
import { PlanBadge } from "@/components/lexpdf/PlanBadge";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { doc?: string } =>
    typeof search["doc"] === "string" ? { doc: search["doc"] as string } : {},

  head: () => ({
    meta: [
      { title: "LexPDF — Análisis de documentos jurídicos con IA" },
      {
        name: "description",
        content:
          "Sube un PDF legal y obtén resumen ejecutivo, esquema por artículos, conceptos clave y un chat que cita el texto. Derecho mexicano.",
      },
      { property: "og:title", content: "LexPDF — Análisis de documentos jurídicos con IA" },
      {
        property: "og:description",
        content:
          "Resúmenes, esquemas y conceptos clave de leyes y contratos mexicanos en segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LexPDF,
});

function LexPDF() {
  const { doc } = Route.useSearch();
  const { usuario } = useSesion();
  const { data: estado } = usePlan();
  const queryClient = useQueryClient();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [jurisdiccion, setJurisdiccion] = useState<JurisdictionId>(DEFAULT_JURISDICTION);
  const [analisis, setAnalisis] = useState<DocumentAnalysis | null>(null);
  const [textoDocumento, setTextoDocumento] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const analizarFn = useServerFn(analizarDocumento);
  const guardarFn = useServerFn(guardarDocumento);
  const obtenerFn = useServerFn(obtenerDocumento);

  useEffect(() => {
    if (!doc || !usuario) return;
    let activo = true;
    obtenerFn({ data: { id: doc } })
      .then((fila) => {
        if (!activo || !fila) return;
        setAnalisis(fila.analisis as unknown as DocumentAnalysis);
        setTextoDocumento(fila.texto ?? "");
      })
      .catch(() => toast.error("No se pudo abrir el documento del historial."));
    return () => {
      activo = false;
    };
  }, [doc, usuario, obtenerFn]);

  const sinPdfs =
    estado && estado.limitePdf !== null && estado.pdfsHoy >= estado.limitePdf;

  const analizar = async () => {
    if (!archivo) return;
    if (!usuario) {
      toast.error("Inicia sesión para analizar documentos.");
      return;
    }
    setAnalizando(true);
    try {
      const texto = await extraerTextoPdf(archivo);
      if (texto.replace(/\[Página \d+\]/g, "").trim().length < 200) {
        toast.error(
          "No se pudo extraer texto del PDF. Parece un documento escaneado (solo imágenes).",
        );
        return;
      }
      setTextoDocumento(texto);
      const resultado = await analizarFn({
        data: { archivo: archivo.name, jurisdiccion, texto: recortar(texto) },
      });
      setAnalisis(resultado as DocumentAnalysis);

      if (usuario) {
        try {
          await guardarFn({
            data: {
              archivo: archivo.name,
              jurisdiccion,
              texto: recortar(texto),
              analisis: resultado,
            },
          });
          toast.success("Documento guardado en tu historial.");
        } catch {
          toast.error("El análisis se generó, pero no se pudo guardar en tu historial.");
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo analizar el documento.");
    } finally {
      setAnalizando(false);
      void queryClient.invalidateQueries({ queryKey: ["estado-plan"] });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl leading-tight font-semibold text-foreground sm:text-4xl">
            Comprende cualquier documento legal en minutos
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Sube un PDF y obtén un resumen ejecutivo, el esquema por temas y artículos, los
            conceptos jurídicos clave y las disposiciones más relevantes. Pensado para
            estudiantes y profesionales del derecho mexicano.
          </p>
          {!usuario && (
            <p className="mt-3 text-sm text-muted-foreground">
              <Link to="/auth" className="font-medium text-primary hover:underline">
                Crea tu cuenta o inicia sesión
              </Link>{" "}
              para analizar documentos y consultarlos después en tu historial.
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-6">
            <UploadPanel
              archivo={archivo}
              onArchivo={(f) => {
                setArchivo(f);
                setAnalisis(null);
              }}
              jurisdiccion={jurisdiccion}
              onJurisdiccion={setJurisdiccion}
              onAnalizar={analizar}
              analizando={analizando}
            />

            {usuario && estado && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <PlanBadge premium={estado.premium} />
                {estado.premium ? (
                  <span className="text-muted-foreground">
                    Documentos y preguntas ilimitadas.
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Hoy: {estado.pdfsHoy}/{estado.limitePdf} documentos ·{" "}
                    {estado.chatsHoy}/{estado.limiteChat} preguntas
                  </span>
                )}
                {!estado.premium && (
                  <Link to="/precios" className="ml-auto font-medium text-primary hover:underline">
                    Pasar a Premium
                  </Link>
                )}
              </div>
            )}

            {sinPdfs && (
              <div className="rounded-xl border border-border bg-brand-soft px-4 py-3 text-sm text-foreground">
                Alcanzaste el límite del plan gratuito ({estado?.limitePdf} documentos por día).
                Pasa a Premium para analizar PDFs ilimitados.
              </div>
            )}
            {analisis && <AnalysisView analisis={analisis} />}
          </div>

          {analisis ? (
            <ChatPanel analisis={analisis} textoDocumento={textoDocumento} />
          ) : (
            <aside className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
              El chat de consultas se activa al analizar un documento: podrás preguntar sobre su
              contenido y recibir respuestas con citas al texto.
            </aside>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        LexPDF · Herramienta de apoyo académico. No constituye asesoría jurídica.
      </footer>
    </div>
  );
}
