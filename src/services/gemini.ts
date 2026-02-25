import { GoogleGenAI, Type } from "@google/genai";

// Função para pegar a chave da API de forma segura sem quebrar o app no navegador (Netlify)
const getApiKey = () => {
  // 1. Tenta pegar a variável do Vite (Netlify)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // 2. Tenta pegar a variável do ambiente Node (AI Studio)
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export interface DentalDiagnosis {
  diagnosis: string;
  damagedTeeth: string[];
  treatments: {
    name: string;
    description: string;
    estimatedCost: number;
  }[];
  totalEstimatedCost: number;
  prognosis: string;
}

export async function analyzeDentalImage(
  base64Image: string,
  mimeType: string,
): Promise<DentalDiagnosis> {
  const prompt = `
    Você é um dentista especialista em diagnóstico por imagem. Analise a imagem fornecida dos dentes de um paciente.
    Identifique quaisquer sinais visíveis de danos causados pela mastigação, erosão dentária, cáries, fraturas ou outros problemas.
    Forneça um diagnóstico detalhado, liste os dentes afetados (se possível identificar), e sugira tratamentos potenciais 
    (como tratamento de canal, coroa dentária, implantes, restaurações, etc.).
    Forneça uma estimativa de custo em Reais (BRL) para cada tratamento e o custo total estimado.
    Responda ESTRITAMENTE no formato JSON solicitado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(",")[1], // Remove the data:image/jpeg;base64, part
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: {
              type: Type.STRING,
              description: "Diagnóstico detalhado dos problemas encontrados.",
            },
            damagedTeeth: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description:
                "Lista dos dentes aparentemente danificados (ex: 'Incisivo central superior', 'Dente 11').",
            },
            treatments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description:
                      "Nome do tratamento (ex: 'Tratamento de Canal', 'Coroa de Porcelana').",
                  },
                  description: {
                    type: Type.STRING,
                    description:
                      "Descrição do porquê o tratamento é necessário.",
                  },
                  estimatedCost: {
                    type: Type.NUMBER,
                    description: "Custo estimado do tratamento em Reais (BRL).",
                  },
                },
                required: ["name", "description", "estimatedCost"],
              },
              description: "Lista de tratamentos recomendados.",
            },
            totalEstimatedCost: {
              type: Type.NUMBER,
              description:
                "Custo total estimado de todos os tratamentos em Reais (BRL).",
            },
            prognosis: {
              type: Type.STRING,
              description:
                "Prognóstico geral da saúde bucal do paciente com base na imagem.",
            },
          },
          required: [
            "diagnosis",
            "damagedTeeth",
            "treatments",
            "totalEstimatedCost",
            "prognosis",
          ],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr) as DentalDiagnosis;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error(
      "Falha ao analisar a imagem. Por favor, tente novamente com uma foto mais clara.",
    );
  }
}
