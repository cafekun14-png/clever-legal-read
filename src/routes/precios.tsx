import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Check, Sparkles, ArrowLeft, Crown } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/lexpdf/AppHeader";
import { Button } from "@/components/ui/button";
import { useSesion } from "@/hooks/useSesion";
import { usePlan } from "@/hooks/usePlan";
import { crearCheckout } from "@/lib/stripe.functions";
import { PLANES } from "@/lib/stripe.server";

export const Route = createFileRoute("/precios")({
  head: () => ({
    meta: [
      { title: "Planes Premium — LexPDF" },
      {
        name: "description",
        content:
          "Suscríbete a LexPDF Premium: documentos y preguntas ilimitadas con prueba gratuita de 7 días.",
      },
      { property: "og:title", content: "Planes Premium — LexPDF" },
      {
        property: "og:description",
        content: "Documentos y preguntas ilimitadas con 7 días de prueba gratis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Precios,
});

function Precios() {
  const { usuario } = useSesion();
  const { data: estado } = usePlan();
  const navigate = useNavigate();
  const checkoutFn = useServerFn(crearCheckout);
  const [cargandoPlan, setCargandoPlan] = useState<string | null>(null);

  const suscribirse = async (planId: string) => {
    if (!usuario) {
      navigate({ to: "/auth" });
      return;
    }
    setCargandoPlan(planId);
    try {
      const result = await checkoutFn({ data: { planId } });
      if (result.url) window.location.href = result.url;
    } catch (e) {
      toast.error(
        e instanceof Error
          ? `No se pudo iniciar el pago: ${e.message}`
          : "No se pudo iniciar el pago.",
      );
      setCargandoPlan(null);
    }
  };

  const ahorro = (meses: number, precioMensual: number, precioTotal: number) => {
    if (meses <= 1) return null;
    const normal = precioMensual * meses;
    const desc = Math.round((1 - precioTotal / normal) * 100);
    return desc > 0 ? desc : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {usuario && (
          <Link
            to="/cuenta"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a mi cuenta
          </Link>
        )}

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Planes Premium de LexPDF
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Documentos y preguntas ilimitadas, acceso completo a tu historial y prioridad en el
            análisis. <span className="font-medium text-foreground">7 días de prueba gratis</span>{" "}
            en todos los planes. Cancela cuando quieras.
          </p>
        </div>

        {estado?.premium && (
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <Crown className="h-4 w-4" />
            Ya tienes Premium activo.{" "}
            <Link to="/cuenta" className="font-medium underline">
              Administrar suscripción
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANES.map((plan) => {
            const descuento = ahorro(plan.meses, PLANES[0]!.precio, plan.precio);
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-panel transition-all ${
                  plan.destacado
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {plan.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Más popular
                  </span>
                )}

                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">{plan.nombre}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.descripcion}</p>
                </div>

                <div className="mb-5">
                  <span className="text-4xl font-bold text-foreground">${plan.precio}</span>
                  <span className="text-sm text-muted-foreground"> MXN</span>
                  <span className="block text-xs text-muted-foreground">
                    {plan.meses === 1 ? "al mes" : `por ${plan.meses} meses`}
                  </span>
                </div>

                {descuento && (
                  <span className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Ahorra {descuento}%
                  </span>
                )}

                <ul className="mb-6 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Documentos PDF ilimitados
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Preguntas al chat ilimitadas
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Historial completo de análisis
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    7 días de prueba gratis
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Cancela cuando quieras
                  </li>
                </ul>

                <Button
                  className="mt-auto w-full py-6"
                  variant={plan.destacado ? "default" : "outline"}
                  disabled={cargandoPlan !== null || estado?.premium === true}
                  onClick={() => suscribirse(plan.id)}
                >
                  {cargandoPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirigiendo…
                    </>
                  ) : estado?.premium ? (
                    "Plan activo"
                  ) : !usuario ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Suscribirme
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Suscribirme
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-brand-soft p-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Dudas sobre los planes? Todos incluyen{" "}
            <strong>7 días de prueba gratuita</strong>. Si cancelas dentro del periodo de prueba no
            se te cobra. Aceptamos cupones de descuento de Stripe en la pantalla de pago.
          </p>
        </div>
      </main>
    </div>
  );
}
