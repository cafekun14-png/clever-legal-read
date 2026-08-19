import { createFileRoute } from "@tanstack/react-router";
import type { Stripe } from "stripe";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/stripe-webhook")({
  ssr: false,
  createServerRoute: () => ({
    POST: async ({ request }: { request: Request }) => {
      const stripe = getStripe();
      const signature = request.headers.get("stripe-signature");
      if (!signature) return new Response("Missing signature", { status: 400 });

      const body = await request.text();

      let event: Stripe.Event;
      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature,
          STRIPE_WEBHOOK_SECRET,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Webhook signature verification failed:", msg);
        return new Response(`Webhook Error: ${msg}`, { status: 400 });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.mode === "subscription" && session.subscription) {
              const subId =
                typeof session.subscription === "string"
                  ? session.subscription
                  : session.subscription.id;
              const sub = await stripe.subscriptions.retrieve(subId);
              await syncSubscription(sub);
            }
            break;
          }
          case "customer.subscription.updated":
          case "customer.subscription.created": {
            const sub = event.data.object as Stripe.Subscription;
            await syncSubscription(sub);
            break;
          }
          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const customerId =
              typeof sub.customer === "string" ? sub.customer : sub.customer.id;
            await supabaseAdmin
              .from("subscriptions")
              .update({
                status: "canceled",
                cancel_at_period_end: false,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", sub.id);
            await supabaseAdmin.rpc("set_plan_from_subscription", {
              _stripe_customer_id: customerId,
              _plan: "free",
            });
            break;
          }
          case "invoice.paid":
          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            if (invoice.subscription) {
              const subId =
                typeof invoice.subscription === "string"
                  ? invoice.subscription
                  : invoice.subscription.id;
              const sub = await stripe.subscriptions.retrieve(subId);
              await syncSubscription(sub);
            }
            break;
          }
          default:
            break;
        }
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      } catch (err) {
        console.error("Webhook handler error:", err);
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
          { status: 500, headers: { "content-type": "application/json" } },
        );
      }
    },
  }),
});

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  if (!customerId) return;

  const isPremium = ["active", "trialing"].includes(sub.status);
  const plan = isPremium ? "premium" : "free";
  const userId = sub.metadata["userId"];

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId ?? crypto.randomUUID(),
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      plan_id: sub.items.data[0]?.price?.id ?? null,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) console.error("Error upserting subscription:", error.message);

  await supabaseAdmin.rpc("set_plan_from_subscription", {
    _stripe_customer_id: customerId,
    _plan: plan,
  });
}
