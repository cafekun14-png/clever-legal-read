import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { consumirUso } from "./usage.server";
import type {
  ArticuloRelevante,
  ConceptoClave,
  EsquemaSeccion,
} from "./analysis-types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.6-flash";

async function llamarIA(system: string, user: string, jsonMode = false) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Falta LOVABLE_API_KEY en el servidor.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (res.status === 429) throw new Error("Límite de solicitudes alcanzado. Intenta de nuevo en un momento.");
  if (res.status === 402) throw new Error("Se agotaron los créditos de IA del espacio de trabajo.");
  if (!res.ok) throw new Error(`Error de IA (${res.status}): ${await res.text()}`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(raw: string): T {
  const limpio = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(limpio) as T;
}

const REGLAS = `Eres un asistente jurídico. Trabajas EXCLUSIVAMENTE con el texto del documento que se te entrega.
Reglas estrictas:
- No inventes artículos, cifras ni disposiciones que no aparezcan literalmente en el texto.
- Cita siempre el identificador tal como aparece en el documento (por ejemplo "Artículo 267, fracción II").
- Si el documento no contiene la información, dilo de forma explícita y clara.
- Interpreta preguntas simples, coloquiales o mal formuladas (por ejemplo "y si me divorcio qué pasa con la casa") y tradúcelas a las figuras jurídicas correspondientes presentes en el documento.
- Responde siempre en español claro.`;

const AnalizarInput = z.object({
  archivo: z.string(),
  jurisdiccion: z.string(),
  texto: z.string().min(1),
});

export const analizarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AnalizarInput.parse(input))
  .handler(async ({ data, context }) => {
    await consumirUso(context.supabase, context.userId, "pdf");

    const prompt = `Analiza el siguiente documento jurídico y devuelve SOLO un objeto JSON con esta forma exacta:
{
  "resumen": { "titulo": string, "naturaleza": string, "puntos": string[] },
  "esquema": [ { "titulo": string, "descripcion": string, "articulos": [ { "identificador": string, "titulo": string, "sintesis": string } ] } ],
  "conceptos": [ { "termino": string, "explicacion": string, "fundamento": string } ],
  "articulos": [ { "articulo": string, "fraccion": string, "extracto": string, "relevancia": "alta"|"media"|"baja" } ]
}
Los extractos deben ser citas textuales del documento. Si alguna sección no puede construirse con el documento, devuélvela vacía.

DOCUMENTO «${data.archivo}»:
"""
${data.texto}
"""`;

    const raw = await llamarIA(REGLAS, prompt, true);
    const out = parseJson<{
      resumen: { titulo: string; naturaleza: string; puntos: string[] };
      esquema: EsquemaSeccion[];
      conceptos: ConceptoClave[];
      articulos: ArticuloRelevante[];
    }>(raw);

    return {
      jurisdiccion: data.jurisdiccion,
      archivo: data.archivo,
      fecha: new Date().toLocaleString("es-MX"),
      resumen: {
        titulo: out.resumen?.titulo ?? data.archivo,
        naturaleza: out.resumen?.naturaleza ?? "",
        puntos: out.resumen?.puntos ?? [],
      },
      esquema: out.esquema ?? [],
      conceptos: out.conceptos ?? [],
      articulos: out.articulos ?? [],
    };
  });

const PreguntarInput = z.object({
  pregunta: z.string().min(1),
  texto: z.string().min(1),
  archivo: z.string(),
  historial: z
    .array(z.object({ rol: z.enum(["usuario", "asistente"]), contenido: z.string() }))
    .max(20)
    .optional(),
});

export const preguntarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PreguntarInput.parse(input))
  .handler(async ({ data, context }) => {
    await consumirUso(context.supabase, context.userId, "chat");

    const historial = (data.historial ?? [])
      .map((m) => `${m.rol === "usuario" ? "Usuario" : "Asistente"}: ${m.contenido}`)
      .join("\n");

    const prompt = `DOCUMENTO «${data.archivo}»:
"""
${data.texto}
"""
${historial ? `\nConversación previa:\n${historial}\n` : ""}
Pregunta del usuario: ${data.pregunta}

Devuelve SOLO un objeto JSON:
{ "respuesta": string, "citas": string[], "encontrado": boolean }
- "respuesta": explicación clara y práctica basada únicamente en el documento.
- "citas": fragmentos textuales del documento con su identificador de artículo (máximo 3). Vacío si no hay.
- "encontrado": false si el documento no contiene la información; en ese caso la respuesta debe decir explícitamente que el documento no aborda ese punto y sugerir qué preguntar.`;

    const raw = await llamarIA(REGLAS, prompt, true);
    return parseJson<{ respuesta: string; citas: string[]; encontrado: boolean }>(raw);
  });
