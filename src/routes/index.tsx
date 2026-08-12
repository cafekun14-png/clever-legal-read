import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Scale } from "lucide-react";
import { UploadPanel } from "@/components/lexpdf/UploadPanel";
import { AnalysisView } from "@/components/lexpdf/AnalysisView";
import { ChatPanel } from "@/components/lexpdf/ChatPanel";
import type { DocumentAnalysis } from "@/lib/analysis-types";
import { mockProvider } from "@/lib/mock-provider";
import { DEFAULT_JURISDICTION, type JurisdictionId } from "@/lib/jurisdictions";

export const Route = createFileRoute("/")({
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
  const [archivo, setArchivo] = useState<File | null>(null);
  const [jurisdiccion, setJurisdiccion] = useState<JurisdictionId>(DEFAULT_JURISDICTION);
  const [analisis, setAnalisis] = useState<DocumentAnalysis | null>(null);
  const [analizando, setAnalizando] = useState(false);

  const analizar = async () => {
    if (!archivo) return;
    setAnalizando(true);
    try {
      setAnalisis(await mockProvider.analizar(archivo, jurisdiccion));
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <p className="font-serif text-xl leading-none font-semibold">LexPDF</p>
            <p className="text-xs text-navy-foreground/70">Análisis jurídico asistido por IA</p>
          </div>
        </div>
      </header>

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
            {analisis && <AnalysisView analisis={analisis} />}
          </div>

          {analisis ? (
            <ChatPanel analisis={analisis} />
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
