import type { DocumentAnalysis } from "./analysis-types";
import { getJurisdiction } from "./jurisdictions";

export function analysisToText(a: DocumentAnalysis): string {
  const l: string[] = [];
  l.push("LexPDF — Análisis jurídico asistido");
  l.push(`Jurisdicción: ${getJurisdiction(a.jurisdiccion).nombre}`);
  l.push(`Documento: ${a.archivo}`);
  l.push(`Fecha: ${a.fecha}`);
  l.push("");
  l.push("1. RESUMEN EJECUTIVO");
  l.push(a.resumen.titulo);
  l.push(a.resumen.naturaleza);
  a.resumen.puntos.forEach((p, i) => l.push(`  ${i + 1}. ${p}`));
  l.push("");
  l.push("2. ESQUEMA DETALLADO");
  a.esquema.forEach((s) => {
    l.push(`• ${s.titulo}`);
    l.push(`  ${s.descripcion}`);
    s.articulos.forEach((art) =>
      l.push(`   - ${art.identificador} — ${art.titulo}: ${art.sintesis}`),
    );
    l.push("");
  });
  l.push("3. CONCEPTOS JURÍDICOS CLAVE");
  a.conceptos.forEach((c) =>
    l.push(`• ${c.termino}${c.fundamento ? ` (${c.fundamento})` : ""}: ${c.explicacion}`),
  );
  l.push("");
  l.push("4. ARTÍCULOS Y FRACCIONES RELEVANTES");
  a.articulos.forEach((art) =>
    l.push(
      `• ${art.articulo}${art.fraccion ? `, ${art.fraccion}` : ""} [relevancia ${art.relevancia}]\n  "${art.extracto}"`,
    ),
  );
  l.push("");
  l.push("Documento generado por LexPDF. Contenido de apoyo académico; no constituye asesoría jurídica.");
  return l.join("\n");
}

export function downloadText(nombre: string, contenido: string) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
