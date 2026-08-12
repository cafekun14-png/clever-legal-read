import { BookOpen, Check, Copy, Download, Gavel, ListTree, Scale } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DocumentAnalysis } from "@/lib/analysis-types";
import { analysisToText, downloadText } from "@/lib/export-analysis";

function Card({
  icon,
  titulo,
  children,
}: {
  icon: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-panel sm:p-6">
      <header className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-primary">
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-foreground">{titulo}</h2>
      </header>
      {children}
    </section>
  );
}

export function AnalysisView({ analisis }: { analisis: DocumentAnalysis }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(analysisToText(analisis));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={copiar}>
          {copiado ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copiado ? "Copiado" : "Copiar análisis"}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            downloadText(
              `LexPDF-${analisis.archivo.replace(/\.pdf$/i, "")}.txt`,
              analysisToText(analisis),
            )
          }
        >
          <Download className="mr-2 h-4 w-4" /> Descargar .txt
        </Button>
      </div>

      <Card icon={<Scale className="h-4 w-4" />} titulo="Resumen ejecutivo">
        <h3 className="text-base font-semibold text-foreground">{analisis.resumen.titulo}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {analisis.resumen.naturaleza}
        </p>
        <ul className="mt-4 space-y-2.5">
          {analisis.resumen.puntos.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {i + 1}
              </span>
              {p}
            </li>
          ))}
        </ul>
      </Card>

      <Card icon={<ListTree className="h-4 w-4" />} titulo="Esquema detallado">
        <div className="space-y-5">
          {analisis.esquema.map((s) => (
            <div key={s.titulo} className="border-l-2 border-accent pl-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                {s.titulo}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.descripcion}</p>
              <ul className="mt-3 space-y-2">
                {s.articulos.map((a) => (
                  <li key={a.identificador} className="rounded-lg bg-secondary px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground">
                      {a.identificador} — {a.titulo}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{a.sintesis}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card icon={<BookOpen className="h-4 w-4" />} titulo="Conceptos jurídicos clave">
        <div className="grid gap-3 sm:grid-cols-2">
          {analisis.conceptos.map((c) => (
            <div key={c.termino} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{c.termino}</span>
                {c.fundamento && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-primary">
                    {c.fundamento}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {c.explicacion}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card icon={<Gavel className="h-4 w-4" />} titulo="Artículos y fracciones relevantes">
        <ul className="space-y-3">
          {analisis.articulos.map((a, i) => (
            <li key={i} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {a.articulo}
                  {a.fraccion ? `, ${a.fraccion}` : ""}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    a.relevancia === "alta"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  Relevancia {a.relevancia}
                </span>
              </div>
              <blockquote className="mt-2 border-l-2 border-primary pl-3 font-serif text-sm italic leading-relaxed text-muted-foreground">
                {a.extracto}
              </blockquote>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
