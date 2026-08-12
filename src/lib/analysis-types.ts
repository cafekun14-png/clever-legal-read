import type { JurisdictionId } from "./jurisdictions";

export interface EsquemaArticulo {
  identificador: string;
  titulo: string;
  sintesis: string;
}

export interface EsquemaSeccion {
  titulo: string;
  descripcion: string;
  articulos: EsquemaArticulo[];
}

export interface ConceptoClave {
  termino: string;
  explicacion: string;
  fundamento?: string;
}

export interface ArticuloRelevante {
  articulo: string;
  fraccion?: string;
  extracto: string;
  relevancia: "alta" | "media" | "baja";
}

export interface DocumentAnalysis {
  jurisdiccion: JurisdictionId;
  archivo: string;
  fecha: string;
  resumen: {
    titulo: string;
    naturaleza: string;
    puntos: string[];
  };
  esquema: EsquemaSeccion[];
  conceptos: ConceptoClave[];
  articulos: ArticuloRelevante[];
}

export interface ChatMessage {
  id: string;
  rol: "usuario" | "asistente";
  contenido: string;
  citas?: string[];
}

/** Contrato que debe cumplir cualquier proveedor de análisis (mock o IA real). */
export interface AnalysisProvider {
  analizar(archivo: File, jurisdiccion: JurisdictionId): Promise<DocumentAnalysis>;
  responder(pregunta: string, analisis: DocumentAnalysis): Promise<ChatMessage>;
}
