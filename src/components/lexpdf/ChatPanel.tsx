import { useEffect, useRef, useState } from "react";
import { Loader2, MessagesSquare, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage, DocumentAnalysis } from "@/lib/analysis-types";
import { preguntarDocumento } from "@/lib/ai.functions";
import { recortar } from "@/lib/pdf-text";

const SUGERENCIAS = [
  "¿De qué trata este documento?",
  "¿Qué dice sobre el divorcio y los bienes?",
  "¿Qué obligaciones establece y en qué artículos?",
];

export function ChatPanel({
  analisis,
  textoDocumento,
}: {
  analisis: DocumentAnalysis;
  textoDocumento: string;
}) {
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const preguntar = useServerFn(preguntarDocumento);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  const enviar = async (pregunta: string) => {
    const limpio = pregunta.trim();
    if (!limpio || cargando) return;
    setTexto("");
    const historial = mensajes.slice(-8).map((m) => ({ rol: m.rol, contenido: m.contenido }));
    setMensajes((m) => [...m, { id: crypto.randomUUID(), rol: "usuario", contenido: limpio }]);
    setCargando(true);
    try {
      const r = await preguntar({
        data: {
          pregunta: limpio,
          texto: recortar(textoDocumento),
          archivo: analisis.archivo,
          historial,
        },
      });
      setMensajes((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          rol: "asistente",
          contenido: r.respuesta,
          citas: r.citas ?? [],
        },
      ]);
    } catch (e) {
      setMensajes((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          rol: "asistente",
          contenido:
            e instanceof Error
              ? `No pude responder: ${e.message}`
              : "No pude responder en este momento.",
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="flex h-[600px] flex-col rounded-2xl border border-border bg-card shadow-panel lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-primary">
          <MessagesSquare className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">Consulta el documento</h2>
          <p className="text-xs text-muted-foreground">Respuestas con citas al texto</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {mensajes.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Pregunta lo que necesites sobre «{analisis.archivo}». Por ejemplo:
            </p>
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {mensajes.map((m) =>
          m.rol === "usuario" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {m.contenido}
              </p>
            </div>
          ) : (
            <div key={m.id} className="space-y-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {m.contenido}
              </p>
              {m.citas?.map((c, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 border-primary bg-secondary px-3 py-2 font-serif text-xs leading-relaxed italic text-muted-foreground"
                >
                  {c}
                </blockquote>
              ))}
            </div>
          ),
        )}

        {cargando && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Analizando el texto…
          </p>
        )}
        <div ref={finRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(texto);
        }}
      >
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void enviar(texto);
            }
          }}
          rows={1}
          placeholder="Escribe tu pregunta jurídica…"
          className="max-h-32 min-h-11 resize-none"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={cargando}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
