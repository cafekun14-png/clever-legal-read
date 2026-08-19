import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripe, getPlan, PLANES } from "./stripe.server";

async function ensureStripeCustomer(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<string> {
  const stripe = getStripe();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  const existingId = perfil?.stripe_customer_id;
  if (existingId) return existingId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await supabase.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);

  return customer.id;
}

const CheckoutInput = z.object({ planId: z.string() });

export const crearCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CheckoutInput.parse(input))
  .handler(async ({ data, context }) => {
    const plan = getPlan(data.planId);
    if (!plan) throw new Error("Plan no válido.");

    const stripe = getStripe();

    const { data: perfil } = await context.supabase
      .from("profiles")
      .select("email, stripe_customer_id")
      .eq("id", context.userId)
      .maybeSingle();

    const email = perfil?.email ?? context.claims.email ?? "";
    const customerId = await ensureStripeCustomer(context.supabase, context.userId, email);

    const origin = process.env["URL"] ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: context.userId, planId: plan.id },
      },
      allow_promotion_codes: true,
      success_url: `${origin}/cuenta?pago=exitoso`,
      cancel_url: `${origin}/cuenta?pago=cancelado`,
      locale: "es",
    });

    return { url: session.url ?? `${origin}/cuenta` };
  });

export const crearPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const stripe = getStripe();

    const { data: perfil } = await context.supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", context.userId)
      .maybeSingle();

    const customerId = perfil?.stripe_customer_id;
    if (!customerId) throw new Error("No tienes una suscripción activa.");

    const origin = process.env["URL"] ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/cuenta`,
    });

    return { url: session.url };
  });

export const listarPlanes = createServerFn({ method: "POST" }).handler(async () => {
  return PLANES.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    meses: p.meses,
    descripcion: p.descripcion,
    destacado: p.destacado ?? false,
  }));
});
