import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { History, LogOut, Scale, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSesion } from "@/hooks/useSesion";

export function AppHeader() {
  const { usuario, cargando } = useSesion();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const salir = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="bg-gradient-navy text-navy-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Scale className="h-5 w-5" />
          </span>
          <span className="block">
            <span className="block font-serif text-xl leading-none font-semibold">LexPDF</span>
            <span className="block text-xs text-navy-foreground/70">
              Análisis jurídico asistido por IA
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 text-sm">
          {cargando ? null : usuario ? (
            <>
              <Link
                to="/historial"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-white/10"
              >
                <History className="h-4 w-4" /> Historial
              </Link>
              <Link
                to="/cuenta"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-white/10"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden max-w-[12rem] truncate sm:inline">{usuario.email}</span>
              </Link>
              <button
                type="button"
                onClick={salir}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-2 transition-colors hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" /> Salir
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-md border border-white/20 px-3 py-2 transition-colors hover:bg-white/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
