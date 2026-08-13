import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Scale } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder a LexPDF — Cuenta e historial de documentos" },
      {
        name: "description",
        content:
          "Crea tu cuenta o inicia sesión en LexPDF para guardar y consultar el historial de tus documentos jurídicos analizados.",
      },
      { property: "og:title", content: "Acceder a LexPDF" },
      {
        property: "og:description",
        content: "Inicia sesión o regístrate para guardar tus análisis jurídicos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Modo = "login" | "registro" | "recuperar";

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (modo === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Sesión iniciada.");
        navigate({ to: "/", replace: true });
      } else if (modo === "registro") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { nombre },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Cuenta creada.");
          navigate({ to: "/", replace: true });
        } else {
          toast.success("Revisa tu correo para confirmar la cuenta.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Te enviamos un enlace para restablecer tu contraseña.");
        setModo("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo completar la operación.");
    } finally {
      setCargando(false);
    }
  };

  const conGoogle = async () => {
    setCargando(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setCargando(false);
      toast.error("No se pudo iniciar sesión con Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="bg-gradient-navy py-6 text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <Scale className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-semibold">LexPDF</span>
          </Link>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-panel sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">
            {modo === "login"
              ? "Inicia sesión"
              : modo === "registro"
                ? "Crea tu cuenta"
                : "Recuperar contraseña"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {modo === "recuperar"
              ? "Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña."
              : "Guarda tus análisis y consulta tu historial de documentos."}
          </p>

          <form onSubmit={enviar} className="mt-6 space-y-4">
            {modo === "registro" && (
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
            </div>
            {modo !== "recuperar" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}

            <Button type="submit" className="w-full py-6" disabled={cargando}>
              {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {modo === "login"
                ? "Entrar"
                : modo === "registro"
                  ? "Crear cuenta"
                  : "Enviar enlace"}
            </Button>
          </form>

          {modo !== "recuperar" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> o continúa con{" "}
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full py-6"
                disabled={cargando}
                onClick={conGoogle}
              >
                Continuar con Google
              </Button>
            </>
          )}

          <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
            {modo === "login" && (
              <>
                <p>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() => setModo("registro")}
                  >
                    Regístrate
                  </button>
                </p>
                <p>
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => setModo("recuperar")}
                  >
                    Olvidé mi contraseña
                  </button>
                </p>
              </>
            )}
            {modo !== "login" && (
              <p>
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setModo("login")}
                >
                  Volver a iniciar sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
