import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY en el servidor.");
  stripeInstance = new Stripe(key, {
    apiVersion: "2025-08-27.basil",
    typescript: true,
  });
  return stripeInstance;
}

export const STRIPE_WEBHOOK_SECRET = process.env["STRIPE_WEBHOOK_SECRET"] ?? "";

export interface PlanInfo {
  id: string;
  nombre: string;
  precio: number;
  meses: number;
  descripcion: string;
  priceId: string;
  destacado?: boolean;
}

export const PLANES: PlanInfo[] = [
  {
    id: "mensual",
    nombre: "Mensual",
    precio: 150,
    meses: 1,
    descripcion: "Facturación mensual, cancela cuando quieras.",
    priceId: process.env["STRIPE_PRICE_MENSUAL"] ?? "price_test_mensual",
  },
  {
    id: "cuatrimestral",
    nombre: "Cuatrimestral",
    precio: 399,
    meses: 4,
    descripcion: "4 meses por un precio reducido.",
    priceId: process.env["STRIPE_PRICE_CUATRIMESTRAL"] ?? "price_test_cuatrimestral",
  },
  {
    id: "semestral",
    nombre: "Semestral",
    precio: 549,
    meses: 6,
    descripcion: "6 meses con mayor ahorro.",
    destacado: true,
    priceId: process.env["STRIPE_PRICE_SEMESTRAL"] ?? "price_test_semestral",
  },
  {
    id: "anual",
    nombre: "Anual",
    precio: 999,
    meses: 12,
    descripcion: "El mejor precio: 12 meses de Premium.",
    priceId: process.env["STRIPE_PRICE_ANUAL"] ?? "price_test_anual",
  },
];

export function getPlan(planId: string): PlanInfo | undefined {
  return PLANES.find((p) => p.id === planId);
}
