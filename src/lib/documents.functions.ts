import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GuardarInput = z.object({
  archivo: z.string().min(1),
  jurisdiccion: z.string().min(1),
  texto: z.string(),
  analisis: z.unknown(),
});

export const guardarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GuardarInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: fila, error } = await context.supabase
      .from("documents")
      .insert({
        user_id: context.userId,
        archivo: data.archivo,
        jurisdiccion: data.jurisdiccion,
        texto: data.texto,
        analisis: data.analisis as never,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: fila.id as string };
  });

export const listarDocumentos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("documents")
      .select("id, archivo, jurisdiccion, created_at, analisis")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const obtenerDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: fila, error } = await context.supabase
      .from("documents")
      .select("id, archivo, jurisdiccion, texto, analisis, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return fila;
  });

export const eliminarDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const obtenerPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, email, nombre, plan")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
