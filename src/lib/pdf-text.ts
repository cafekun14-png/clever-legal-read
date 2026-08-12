/** Extracción de texto real de un PDF en el navegador (pdf.js). */
export async function extraerTextoPdf(archivo: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buffer = await archivo.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const paginas: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const texto = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    paginas.push(`[Página ${i}]\n${texto}`);
  }
  await doc.destroy();
  return paginas.join("\n\n").trim();
}

/** Límite prudente de caracteres enviados al modelo. */
export const MAX_CARACTERES = 120_000;

export function recortar(texto: string, max = MAX_CARACTERES): string {
  return texto.length <= max ? texto : `${texto.slice(0, max)}\n\n[…documento truncado…]`;
}
