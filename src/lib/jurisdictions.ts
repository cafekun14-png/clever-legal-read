/**
 * Registro modular de jurisdicciones.
 * Para agregar una nueva jurisdicción (España, Colombia, etc.) basta con
 * añadir una entrada aquí y un proveedor de análisis en `analysis-providers.ts`.
 */

export type JurisdictionId = "mx" | "es" | "co";

export interface Jurisdiction {
  id: JurisdictionId;
  nombre: string;
  bandera: string;
  disponible: boolean;
  descripcion: string;
}

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: "mx",
    nombre: "México",
    bandera: "🇲🇽",
    disponible: true,
    descripcion: "Constitución, códigos federales y leyes generales mexicanas.",
  },
  {
    id: "es",
    nombre: "España",
    bandera: "🇪🇸",
    disponible: false,
    descripcion: "Próximamente: BOE, códigos y jurisprudencia española.",
  },
  {
    id: "co",
    nombre: "Colombia",
    bandera: "🇨🇴",
    disponible: false,
    descripcion: "Próximamente: normativa y jurisprudencia colombiana.",
  },
];

export const DEFAULT_JURISDICTION: JurisdictionId = "mx";

export function getJurisdiction(id: JurisdictionId): Jurisdiction {
  return JURISDICTIONS.find((j) => j.id === id) ?? JURISDICTIONS[0];
}
