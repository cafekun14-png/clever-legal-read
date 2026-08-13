import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Sesión del usuario en el cliente. */
export function useSesion() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      setUsuario(data.session?.user ?? null);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(session?.user ?? null);
      setCargando(false);
    });
    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { usuario, cargando };
}
