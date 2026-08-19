import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LIMITE_CHAT_FREE, LIMITE_PDF_FREE, inicioDelDiaISO } from "./limits";

export const obtenerEstadoPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const desde = inicioDelDiaISO();
    const [perfil, rol, pdfs, chats, sub] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("plan, email, nombre, stripe_customer_id")
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle(),
      context.supabase
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "pdf")
        .gte("created_at", desde),
      context.supabase
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "chat")
        .gte("created_at", desde),
      context.supabase
        .from("subscriptions")
        .select("status, current_period_end, cancel_at_period_end, stripe_customer_id")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const premium = perfil.data?.plan === "premium";
    const tieneSuscripcion = !!perfil.data?.stripe_customer_id && !!sub.data;
    return {
      plan: (perfil.data?.plan ?? "free") as "free" | "premium",
      premium,
      esAdmin: rol.data?.role === "admin",
      email: perfil.data?.email ?? null,
      nombre: perfil.data?.nombre ?? null,
      pdfsHoy: pdfs.count ?? 0,
      chatsHoy: chats.count ?? 0,
      limitePdf: premium ? null : LIMITE_PDF_FREE,
      limiteChat: premium ? null : LIMITE_CHAT_FREE,
      tieneSuscripcion,
      estadoSuscripcion: sub.data?.status ?? null,
      periodoFin: sub.data?.current_period_end ?? null,
      cancelaAlFin: sub.data?.cancel_at_period_end ?? false,
    };
  });

/** Verifica en el servidor si el usuario tiene rol de administrador. */
async function esAdministrador(
  supabase: { from: (t: "user_roles") => any },
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return data?.role === "admin";
}

/** Solo administradores: lista de usuarios con su plan. */
export const adminListarUsuarios = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await esAdministrador(context.supabase as never, context.userId))) {
      throw new Error("No autorizado");
    }
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, email, nombre, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Solo administradores: cambia el plan de un usuario por correo. */
export const adminCambiarPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ email: z.string().email(), plan: z.enum(["free", "premium"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!(await esAdministrador(context.supabase as never, context.userId))) {
      throw new Error("No autorizado");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: filas, error } = await supabaseAdmin
      .from("profiles")
      .update({ plan: data.plan, updated_at: new Date().toISOString() })
      .ilike("email", data.email.trim())
      .select("id, email, plan");
    if (error) throw new Error(error.message);
    if (!filas || filas.length === 0) throw new Error("No existe una cuenta con ese correo.");
    return filas[0]!;
  });
