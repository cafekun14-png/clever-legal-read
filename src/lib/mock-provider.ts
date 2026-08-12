import type {
  AnalysisProvider,
  ChatMessage,
  DocumentAnalysis,
} from "./analysis-types";
import type { JurisdictionId } from "./jurisdictions";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildMexicanAnalysis(
  archivo: string,
  jurisdiccion: JurisdictionId,
): DocumentAnalysis {
  return {
    jurisdiccion,
    archivo,
    fecha: new Date().toLocaleString("es-MX"),
    resumen: {
      titulo: "Ley Federal del Trabajo — Disposiciones sobre relaciones individuales",
      naturaleza:
        "Documento normativo de carácter federal, de orden público e interés social, aplicable en toda la República Mexicana conforme al artículo 123, apartado A, de la Constitución Política de los Estados Unidos Mexicanos.",
      puntos: [
        "Regula las relaciones individuales de trabajo, definiendo la relación laboral como la prestación de un trabajo personal subordinado mediante el pago de un salario.",
        "Establece la presunción de existencia del contrato y de la relación de trabajo entre quien presta el servicio personal y quien lo recibe, invirtiendo la carga probatoria en favor de la persona trabajadora.",
        "Fija las condiciones mínimas de trabajo: jornada máxima, días de descanso, vacaciones, prima vacacional y aguinaldo, con carácter irrenunciable.",
        "Determina las causales de rescisión sin responsabilidad para el patrón y para la persona trabajadora, así como las indemnizaciones aplicables.",
        "Incorpora el principio de trabajo digno o decente, con perspectiva de género y prohibición expresa de discriminación.",
      ],
    },
    esquema: [
      {
        titulo: "Título Primero — Principios Generales",
        descripcion:
          "Delimita el ámbito de aplicación de la ley, define el trabajo digno y establece la irrenunciabilidad de los derechos laborales.",
        articulos: [
          {
            identificador: "Artículo 2°",
            titulo: "Trabajo digno o decente",
            sintesis:
              "Define el trabajo digno como aquel en el que se respeta la dignidad humana, no hay discriminación y se percibe un salario remunerador.",
          },
          {
            identificador: "Artículo 3°",
            titulo: "El trabajo como derecho y deber social",
            sintesis:
              "Establece que el trabajo no es artículo de comercio y prohíbe distinciones por origen étnico, género, edad, discapacidad o condición social.",
          },
        ],
      },
      {
        titulo: "Título Segundo — Relaciones Individuales de Trabajo",
        descripcion:
          "Regula el nacimiento, duración, suspensión, rescisión y terminación de la relación laboral.",
        articulos: [
          {
            identificador: "Artículo 20",
            titulo: "Relación y contrato de trabajo",
            sintesis:
              "Define la relación de trabajo como la prestación de un trabajo personal subordinado mediante el pago de un salario, cualquiera que sea el acto que le dé origen.",
          },
          {
            identificador: "Artículo 47",
            titulo: "Rescisión sin responsabilidad para el patrón",
            sintesis:
              "Enumera las causas de rescisión y obliga a entregar aviso escrito de la fecha y causa de la separación.",
          },
          {
            identificador: "Artículo 48",
            titulo: "Acciones del trabajador despedido",
            sintesis:
              "Permite optar entre la reinstalación o la indemnización constitucional de tres meses de salario, más salarios caídos hasta por doce meses.",
          },
        ],
      },
      {
        titulo: "Título Tercero — Condiciones de Trabajo",
        descripcion:
          "Comprende jornada, días de descanso, vacaciones, salario y prestaciones mínimas.",
        articulos: [
          {
            identificador: "Artículo 61",
            titulo: "Duración máxima de la jornada",
            sintesis:
              "Ocho horas la jornada diurna, siete la nocturna y siete horas y media la mixta.",
          },
          {
            identificador: "Artículo 76",
            titulo: "Vacaciones",
            sintesis:
              "Doce días laborables de vacaciones al cumplir un año de servicios, incrementándose conforme a la antigüedad.",
          },
          {
            identificador: "Artículo 87",
            titulo: "Aguinaldo",
            sintesis:
              "Derecho a un aguinaldo anual equivalente a quince días de salario, pagadero antes del 20 de diciembre.",
          },
        ],
      },
    ],
    conceptos: [
      {
        termino: "Subordinación",
        explicacion:
          "Elemento esencial de la relación laboral: facultad jurídica del patrón de mandar y deber correlativo de obediencia de la persona trabajadora dentro del servicio contratado.",
        fundamento: "Art. 20 LFT",
      },
      {
        termino: "Indemnización constitucional",
        explicacion:
          "Pago de tres meses de salario integrado que procede cuando el despido es injustificado y la persona trabajadora no opta por la reinstalación.",
        fundamento: "Arts. 48 y 50 LFT",
      },
      {
        termino: "Salario integrado",
        explicacion:
          "Base de cálculo de indemnizaciones; se compone de cuota diaria, gratificaciones, primas, comisiones y cualquier prestación entregada por el trabajo.",
        fundamento: "Art. 84 LFT",
      },
      {
        termino: "Irrenunciabilidad de derechos",
        explicacion:
          "Principio tutelar por el cual toda estipulación que implique renuncia de derechos laborales mínimos se tiene por no puesta.",
        fundamento: "Art. 5° LFT",
      },
      {
        termino: "Prima de antigüedad",
        explicacion:
          "Prestación de doce días de salario por cada año de servicios, con tope de dos veces el salario mínimo como base de cálculo.",
        fundamento: "Art. 162 LFT",
      },
      {
        termino: "Estabilidad en el empleo",
        explicacion:
          "Derecho a conservar el trabajo mientras subsista la materia del mismo, salvo causa justificada de rescisión legalmente acreditada.",
        fundamento: "Art. 123-A, fr. XXII CPEUM",
      },
    ],
    articulos: [
      {
        articulo: "Artículo 47",
        fraccion: "Fracción II",
        extracto:
          "Incurrir el trabajador, durante sus labores, en faltas de probidad u honradez, en actos de violencia, amagos, injurias o malos tratamientos en contra del patrón, sus familiares o del personal directivo…",
        relevancia: "alta",
      },
      {
        articulo: "Artículo 48",
        extracto:
          "El trabajador podrá solicitar ante el Tribunal, a su elección, que se le reinstale en el trabajo que desempeñaba, o que se le indemnice con el importe de tres meses de salario…",
        relevancia: "alta",
      },
      {
        articulo: "Artículo 51",
        fraccion: "Fracción II",
        extracto:
          "Incurrir el patrón, sus familiares o su personal directivo, dentro del servicio, en faltas de probidad u honradez, actos de violencia, amenazas, injurias, hostigamiento y/o acoso sexual…",
        relevancia: "media",
      },
      {
        articulo: "Artículo 76",
        extracto:
          "Las personas trabajadoras que tengan más de un año de servicios disfrutarán de un periodo anual de vacaciones pagadas, que en ningún caso podrá ser inferior a doce días laborables…",
        relevancia: "media",
      },
      {
        articulo: "Artículo 123 CPEUM",
        fraccion: "Apartado A, fracción XXII",
        extracto:
          "El patrono que despida a un obrero sin causa justificada… estará obligado, a elección del trabajador, a cumplir el contrato o a indemnizarlo con el importe de tres meses de salario.",
        relevancia: "alta",
      },
    ],
  };
}

const RESPUESTAS: { claves: string[]; texto: string; citas: string[] }[] = [
  {
    claves: ["despido", "injustificado", "indemniz"],
    texto:
      "Ante un despido injustificado, la persona trabajadora puede elegir entre la reinstalación en su puesto o el pago de la indemnización constitucional de tres meses de salario integrado, además de los salarios caídos que se generen hasta por doce meses y, en su caso, la prima de antigüedad. La carga de acreditar la causa justificada corresponde al patrón, quien además debe haber entregado el aviso de rescisión por escrito.",
    citas: [
      "Artículo 48 LFT: «El trabajador podrá solicitar ante el Tribunal, a su elección, que se le reinstale en el trabajo que desempeñaba, o que se le indemnice con el importe de tres meses de salario…»",
      "Artículo 47, último párrafo LFT: «El patrón deberá dar al trabajador aviso escrito de la fecha y causa o causas de la rescisión.»",
    ],
  },
  {
    claves: ["vacacion", "aguinaldo", "prima"],
    texto:
      "El documento fija prestaciones mínimas irrenunciables: doce días laborables de vacaciones al primer año (incrementándose por antigüedad), una prima vacacional de al menos 25% sobre los salarios de ese periodo y un aguinaldo anual de quince días de salario pagadero antes del 20 de diciembre.",
    citas: [
      "Artículo 76 LFT: «…en ningún caso podrá ser inferior a doce días laborables…»",
      "Artículo 87 LFT: «Los trabajadores tendrán derecho a un aguinaldo anual que deberá pagarse antes del día veinte de diciembre, equivalente a quince días de salario, por lo menos.»",
    ],
  },
  {
    claves: ["jornada", "horas", "horario", "extra"],
    texto:
      "La jornada máxima legal es de ocho horas en turno diurno, siete en nocturno y siete horas y media en jornada mixta. Las horas que excedan se pagan como tiempo extraordinario al doble del salario y, a partir de nueve horas extra semanales, al triple.",
    citas: [
      "Artículo 61 LFT: «La duración máxima de la jornada será: ocho horas la diurna, siete la nocturna y siete horas y media la mixta.»",
    ],
  },
  {
    claves: ["subordinac", "relacion de trabajo", "relación de trabajo", "contrato"],
    texto:
      "La relación de trabajo se configura por la prestación de un trabajo personal subordinado mediante el pago de un salario, con independencia del acto que le dé origen. La subordinación —facultad de mando y deber de obediencia— es el elemento distintivo frente a una prestación de servicios civil o mercantil.",
    citas: [
      "Artículo 20 LFT: «Se entiende por relación de trabajo, cualquiera que sea el acto que le dé origen, la prestación de un trabajo personal subordinado a una persona, mediante el pago de un salario.»",
    ],
  },
];

export const mockProvider: AnalysisProvider = {
  async analizar(archivo: File, jurisdiccion: JurisdictionId) {
    await delay(1800);
    return buildMexicanAnalysis(archivo.name, jurisdiccion);
  },

  async responder(pregunta: string, analisis: DocumentAnalysis): Promise<ChatMessage> {
    await delay(1100);
    const p = pregunta.toLowerCase();
    const match = RESPUESTAS.find((r) => r.claves.some((c) => p.includes(c)));

    if (match) {
      return {
        id: crypto.randomUUID(),
        rol: "asistente",
        contenido: match.texto,
        citas: match.citas,
      };
    }

    return {
      id: crypto.randomUUID(),
      rol: "asistente",
      contenido: `Con base en el documento «${analisis.archivo}», el ordenamiento analizado es de orden público e interés social y sus disposiciones mínimas son irrenunciables. No localicé un pasaje que responda de forma literal a tu pregunta; puedes reformularla haciendo referencia a una figura concreta (por ejemplo: despido, jornada, vacaciones, subordinación) para que cite los artículos aplicables.`,
      citas: [
        `${analisis.esquema[0].articulos[0].identificador}: ${analisis.esquema[0].articulos[0].sintesis}`,
      ],
    };
  },
};
