import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/lexpdf/AppHeader";
import { PlanBadge } from "@/components/lexpdf/PlanBadge";
import { usePlan } from "@/hooks/usePlan";


export const Route = createFileRoute("/_authenticated/cuenta")({
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
  const premium = data?.premium === true;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Mi cuenta</h1>

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

            {!premium && (
              <div className="rounded-2xl border border-border bg-brand-soft p-6">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Pasa a Premium
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Con Premium tendrás documentos y preguntas ilimitadas, además de acceso completo
                  a tu historial. Los pagos estarán disponibles muy pronto.
                </p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
