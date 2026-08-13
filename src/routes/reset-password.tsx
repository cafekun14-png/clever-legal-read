import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/lexpdf/AppHeader";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Restablecer contraseña — LexPDF" },
      {
        name: "description",
        content: "Define una nueva contraseña para tu cuenta de LexPDF.",
      },
      { property: "og:title", content: "Restablecer contraseña — LexPDF" },
      { property: "og:description", content: "Define una nueva contraseña para tu cuenta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Contraseña actualizada.");
      navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
          <h1 className="text-2xl font-semibold text-foreground">Nueva contraseña</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Escribe la contraseña que usarás a partir de ahora.
          </p>
          <form onSubmit={enviar} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full py-6" disabled={cargando}>
              {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar contraseña
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
