import { Utensils, Coffee, Beer, Bus } from "lucide-react";
import type { CurrencyCode } from "@/lib/types";

export interface Equivalence {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  price: number;
}

export const EQUIVALENCES: Partial<Record<CurrencyCode, Equivalence>> = {
  PEN: { icon: Utensils, label: "almuerzos", price: 18 },
  USD: { icon: Coffee, label: "cafés", price: 5 },
  EUR: { icon: Beer, label: "pintas", price: 5 },
  GBP: { icon: Bus, label: "bus tickets", price: 2.5 },
  // LatAm — usan "almuerzo local" como equivalencia base
  BRL: { icon: Utensils, label: "almuerços", price: 25 },
  MXN: { icon: Utensils, label: "comidas", price: 80 },
  COP: { icon: Coffee, label: "tintos", price: 4000 },
  CLP: { icon: Coffee, label: "cafés", price: 2500 },
  ARS: { icon: Utensils, label: "almuerzos", price: 5000 },
  UYU: { icon: Utensils, label: "almuerzos", price: 200 },
  PYG: { icon: Bus, label: "pasajes", price: 5000 },
  BOB: { icon: Utensils, label: "almuerzos", price: 25 },
  VES: { icon: Coffee, label: "cafés", price: 200 },
  GTQ: { icon: Utensils, label: "almuerzos", price: 25 },
  HNL: { icon: Utensils, label: "almuerzos", price: 80 },
  NIO: { icon: Utensils, label: "almuerzos", price: 120 },
  CRC: { icon: Coffee, label: "cafés", price: 1500 },
  PAB: { icon: Coffee, label: "coffees", price: 3 },
  DOP: { icon: Utensils, label: "almuerzos", price: 250 },
  CUP: { icon: Coffee, label: "cafés", price: 60 },
  CAD: { icon: Coffee, label: "coffees", price: 4 },
};

export function getEquivalence(currency: CurrencyCode): Equivalence {
  return EQUIVALENCES[currency] ?? EQUIVALENCES.PEN ?? { icon: Utensils, label: "almuerzos", price: 15 };
}
