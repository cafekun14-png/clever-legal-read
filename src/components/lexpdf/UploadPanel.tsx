import { useRef, useState } from "react";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JURISDICTIONS, type JurisdictionId } from "@/lib/jurisdictions";

interface Props {
  archivo: File | null;
  onArchivo: (f: File | null) => void;
  jurisdiccion: JurisdictionId;
  onJurisdiccion: (j: JurisdictionId) => void;
  onAnalizar: () => void;
  analizando: boolean;
}

export function UploadPanel({
  archivo,
  onArchivo,
  jurisdiccion,
  onJurisdiccion,
  onAnalizar,
  analizando,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const aceptar = (files: FileList | null) => {
    const f = files?.[0];
    if (f && f.type === "application/pdf") onArchivo(f);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-panel sm:p-7">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Jurisdicción
        </span>
        <div className="flex flex-wrap gap-2">
          {JURISDICTIONS.map((j) => (
            <button
              key={j.id}
              type="button"
              disabled={!j.disponible}
              title={j.descripcion}
              onClick={() => onJurisdiccion(j.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                jurisdiccion === j.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-muted-foreground hover:bg-accent disabled:opacity-50"
              }`}
            >
              {j.bandera} {j.nombre}
              {!j.disponible && " · pronto"}
            </button>
          ))}
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          aceptar(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
          dragging ? "border-primary bg-brand-soft" : "border-border bg-secondary/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => aceptar(e.target.files)}
        />
        <UploadCloud className="mb-3 h-9 w-9 text-primary" />
        <p className="text-sm font-medium text-foreground">
          Arrastra tu PDF aquí o haz clic para seleccionarlo
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Leyes, contratos, sentencias o tesis en formato PDF
        </p>
      </div>

      {archivo && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-brand-soft px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{archivo.name}</p>
            <p className="text-xs text-muted-foreground">
              {(archivo.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <button
            type="button"
            aria-label="Quitar archivo"
            onClick={() => onArchivo(null)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        className="mt-5 w-full py-6 text-base"
        disabled={!archivo || analizando}
        onClick={onAnalizar}
      >
        {analizando ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando documento…
          </>
        ) : (
          "Analizar documento"
        )}
      </Button>
    </section>
  );
}
