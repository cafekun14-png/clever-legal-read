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
  const perfilFn = useServerFn(obtenerPerfil);
  const { data, isLoading } = useQuery({
    queryKey: ["perfil"],
    queryFn: () => perfilFn({ data: undefined }),
  });

  const premium = data?.plan === "premium";

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
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="font-medium text-foreground">
                    {premium ? "Premium" : "Gratuito"}
                  </dd>
                </div>
              </dl>
            </div>

            {!premium && (
              <div className="rounded-2xl border border-border bg-brand-soft p-6">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" /> Plan Premium
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Muy pronto podrás mejorar tu plan para analizar documentos más largos, guardar
                  más historial y acceder a funciones avanzadas.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
