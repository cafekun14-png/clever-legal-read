import type { SupabaseClient } from "@supabase/supabase-js";
import { LIMITE_CHAT_FREE, LIMITE_PDF_FREE, inicioDelDiaISO } from "./limits";

type Cliente = SupabaseClient<any, any, any>;

/**
 * Verifica el límite diario del plan gratuito y registra el uso.
 * Lanza un error en español cuando el usuario gratuito alcanza el límite.
 */
export async function consumirUso(
  supabase: Cliente,
  userId: string,
  tipo: "pdf" | "chat",
): Promise<void> {
  const { data: perfil } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  const premium = perfil?.plan === "premium";

  if (!premium) {
    const limite = tipo === "pdf" ? LIMITE_PDF_FREE : LIMITE_CHAT_FREE;
    const { count } = await supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("tipo", tipo)
      .gte("created_at", inicioDelDiaISO());

    if ((count ?? 0) >= limite) {
      throw new Error(
        tipo === "pdf"
          ? `Alcanzaste el límite del plan gratuito: ${limite} documentos por día. Pasa a Premium para analizar PDFs ilimitados.`
          : `Alcanzaste el límite del plan gratuito: ${limite} preguntas al chat por día. Pasa a Premium para preguntar sin límites.`,
      );
    }
  }

  await supabase.from("usage_events").insert({ user_id: userId, tipo });
}
