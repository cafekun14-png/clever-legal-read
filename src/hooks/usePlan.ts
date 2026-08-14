import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { obtenerEstadoPlan } from "@/lib/plan.functions";
import { useSesion } from "./useSesion";

/** Estado del plan del usuario y su consumo diario. */
export function usePlan() {
  const { usuario } = useSesion();
  const estadoFn = useServerFn(obtenerEstadoPlan);
  return useQuery({
    queryKey: ["estado-plan", usuario?.id ?? null],
    queryFn: () => estadoFn({ data: undefined }),
    enabled: Boolean(usuario),
  });
}
