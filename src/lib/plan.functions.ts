import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LIMITE_CHAT_FREE, LIMITE_PDF_FREE, inicioDelDiaISO } from "./limits";

export const obtenerEstadoPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const desde = inicioDelDiaISO();
    const [perfil, rol, pdfs, chats] = await Promise.all([
      context.supabase.from("profiles").select("plan, email, nombre").eq("id", context.userId).maybeSingle(),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
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
    ]);

    const premium = perfil.data?.plan === "premium";
    return {
      plan: (perfil.data?.plan ?? "free") as "free" | "premium",
      premium,
      esAdmin: rol.data === true,
      email: perfil.data?.email ?? null,
      nombre: perfil.data?.nombre ?? null,
      pdfsHoy: pdfs.count ?? 0,
      chatsHoy: chats.count ?? 0,
      limitePdf: premium ? null : LIMITE_PDF_FREE,
      limiteChat: premium ? null : LIMITE_CHAT_FREE,
    };
  });

/** Solo administradores: lista de usuarios con su plan. */
export const adminListarUsuarios = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: esAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (esAdmin !== true) throw new Error("No autorizado");
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
    const { data: filas, error } = await context.supabase.rpc("admin_set_plan", {
      _email: data.email,
      _plan: data.plan,
    });
    if (error) throw new Error(error.message);
    if (!filas || filas.length === 0) throw new Error("No existe una cuenta con ese correo.");
    return filas[0]!;
  });
