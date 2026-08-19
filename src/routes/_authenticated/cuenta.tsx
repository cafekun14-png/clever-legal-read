import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles, Crown, CreditCard, Settings2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppHeader } from "@/components/lexpdf/AppHeader";
import { PlanBadge } from "@/components/lexpdf/PlanBadge";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";
import { crearPortal } from "@/lib/stripe.functions";

export const Route = createFileRoute("/_authenticated/cuenta")({
  validateSearch: (search: Record<string, unknown>): { pago?: string } =>
    typeof search["pago"] === "string" ? { pago: search["pago"] as string } : {},
  head: () => ({
    meta: [
      { title: "Mi cuenta — LexPDF" },
      {
        name: "description",
        content: "Consulta los datos de tu cuenta y tu plan actual en LexPDF.",
      },
      { property: "og:title", content: "Mi cuenta — LexPDF" },
      { property: "og:description", content: "Datos de tu cuenta y plan en LexPDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cuenta,
});

function Cuenta() {
  const { data, isLoading } = usePlan();
  const { pago } = useSearch({ from: "/_authenticated/cuenta" });
  const premium = data?.premium === true;
  const navigate = useNavigate();
  const portalFn = useServerFn(crearPortal);
  const [abriendoPortal, setAbriendoPortal] = useState(false);

  const abrirPortal = async () => {
    setAbriendoPortal(true);
    try {
      const result = await portalFn({ data: undefined });
      if (result.url) window.location.href = result.url;
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo abrir el portal de administración.",
      );
      setAbriendoPortal(false);
    }
  };

  const fechaFin = data?.periodoFin ? new Date(data.periodoFin) : null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Mi cuenta</h1>

        {pago === "exitoso" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            ¡Pago exitoso! Tu plan Premium está activo.
            <button
              onClick={() => navigate({ to: "/cuenta", search: {} })}
              className="ml-auto text-green-700 dark:text-green-300"
            >
              ✕
            </button>
          </div>
        )}
        {pago === "cancelado" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            El pago fue cancelado. Tu plan no ha cambiado.
            <button
              onClick={() => navigate({ to: "/cuenta", search: {} })}
              className="ml-auto text-muted-foreground"
            >
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Nombre</dt>
                  <dd className="font-medium text-foreground">{data?.nombre || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Correo</dt>
                  <dd className="truncate font-medium text-foreground">{data?.email || "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd>
                    <PlanBadge premium={premium} />
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
              <p className="text-sm font-medium text-foreground">Uso de hoy</p>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Documentos analizados</dt>
                  <dd className="font-medium text-foreground">
                    {data?.pdfsHoy ?? 0}
                    {data?.limitePdf ? ` / ${data.limitePdf}` : " · ilimitados"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Preguntas al chat</dt>
                  <dd className="font-medium text-foreground">
                    {data?.chatsHoy ?? 0}
                    {data?.limiteChat ? ` / ${data.limiteChat}` : " · ilimitadas"}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Los límites se reinician cada día a la medianoche (hora del centro de México).
              </p>
            </div>

            {premium && data?.tieneSuscripcion && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Crown className="h-4 w-4 text-amber-500" /> Suscripción activa
                </p>
                {fechaFin && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {data.cancelaAlFin
                      ? `Tu suscripción se cancelará al final del periodo: ${fechaFin.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}.`
                      : `Próxima renovación: ${fechaFin.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}.`}
                  </p>
                )}
                <Button
                  className="mt-4 w-full py-5"
                  variant="outline"
                  disabled={abriendoPortal}
                  onClick={abrirPortal}
                >
                  {abriendoPortal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Abriendo…
                    </>
                  ) : (
                    <>
                      <Settings2 className="mr-2 h-4 w-4" /> Administrar suscripción
                    </>
                  )}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Cancela, cambia de plan o actualiza tu método de pago de forma segura a través de
                  Stripe.
                </p>
              </div>
            )}

            {!premium && (
              <div className="rounded-2xl border border-border bg-brand-soft p-6">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Pasa a Premium
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Con Premium tendrás documentos y preguntas ilimitadas, además de acceso completo a
                  tu historial. Prueba gratis 7 días.
                </p>
                <Link to="/precios">
                  <Button className="mt-4 w-full py-5">
                    <CreditCard className="mr-2 h-4 w-4" /> Ver planes y precios
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
