import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/lexpdf/AppHeader";
import { PlanBadge } from "@/components/lexpdf/PlanBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminCambiarPlan, adminListarUsuarios } from "@/lib/plan.functions";
import { usePlan } from "@/hooks/usePlan";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administración — LexPDF" },
      { name: "description", content: "Panel privado de administración de planes de LexPDF." },
      { property: "og:title", content: "Administración — LexPDF" },
      { property: "og:description", content: "Panel privado de administración de LexPDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { data: estado, isLoading } = usePlan();
  const queryClient = useQueryClient();
  const listarFn = useServerFn(adminListarUsuarios);
  const cambiarFn = useServerFn(adminCambiarPlan);
  const [email, setEmail] = useState("");

  const usuarios = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: () => listarFn({ data: undefined }),
    enabled: estado?.esAdmin === true,
  });

  const cambiar = useMutation({
    mutationFn: (v: { email: string; plan: "free" | "premium" }) => cambiarFn({ data: v }),
    onSuccess: (r) => {
      toast.success(`${r.email ?? "Usuario"} ahora es ${r.plan === "premium" ? "Premium" : "Gratuito"}.`);
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["admin-usuarios"] });
      void queryClient.invalidateQueries({ queryKey: ["estado-plan"] });
      void queryClient.invalidateQueries({ queryKey: ["perfil"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "No se pudo cambiar el plan."),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </p>
        </main>
      </div>
    );
  }

  if (!estado?.esAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-semibold text-foreground">Acceso restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta sección es exclusiva del administrador de LexPDF.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground sm:text-3xl">
          <ShieldCheck className="h-6 w-6 text-primary" /> Administración
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Asigna manualmente el plan Premium a cuentas específicas.
        </p>

        <form
          className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) cambiar.mutate({ email: email.trim(), plan: "premium" });
          }}
        >
          <label className="text-sm font-medium text-foreground" htmlFor="email-admin">
            Correo de la cuenta
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <Input
              id="email-admin"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@correo.com"
              className="min-w-[16rem] flex-1"
              required
            />
            <Button type="submit" disabled={cambiar.isPending}>
              Dar Premium
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={cambiar.isPending || !email.trim()}
              onClick={() => cambiar.mutate({ email: email.trim(), plan: "free" })}
            >
              Quitar Premium
            </Button>
          </div>
        </form>

        <section className="mt-8">
          <h2 className="text-base font-semibold text-foreground">Usuarios</h2>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {usuarios.isLoading && (
              <p className="px-4 py-4 text-sm text-muted-foreground">Cargando usuarios…</p>
            )}
            {usuarios.data?.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {u.email ?? "—"}
                  {u.nombre ? <span className="text-muted-foreground"> · {u.nombre}</span> : null}
                </span>
                <PlanBadge premium={u.plan === "premium"} />
                <Button
                  size="sm"
                  variant={u.plan === "premium" ? "outline" : "default"}
                  disabled={cambiar.isPending || !u.email}
                  onClick={() =>
                    cambiar.mutate({
                      email: u.email!,
                      plan: u.plan === "premium" ? "free" : "premium",
                    })
                  }
                >
                  {u.plan === "premium" ? "Quitar" : "Dar Premium"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
