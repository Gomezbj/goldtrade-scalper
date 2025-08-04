
import { GoogleGenAI, GenerateContentResponse, Part, Chat } from "@google/genai";
import { FractalAnalysisResult, TradingDecision, ConfidenceLevel, isValidTradingDecision, isValidConfidenceLevel, IdentifiedPattern, BoundingBox } from '../types';
import { GEMINI_MODEL_NAME, ANALYSIS_PROMPT } from '../constants';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please set the process.env.API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    prediction: {
      type: Type.STRING,
      description: "La señal de trading: debe ser uno de BUY, SELL, o WAIT.",
      enum: ['BUY', 'SELL', 'WAIT'],
    },
    assetName: {
        type: Type.STRING,
        description: "El nombre del activo o par de divisas analizado, extraído de la esquina superior izquierda de las imágenes (por ejemplo, 'EUR/USD', 'BTC/USDT'). Si no es visible, omitir."
    },
    justification: {
      type: Type.STRING,
      description: "Una explicación concisa para la predicción basada en el análisis fractal de las imágenes del gráfico proporcionadas."
    },
    entryPoint: {
      type: Type.STRING,
      description: "El precio de entrada sugerido para la operación. Omitir si la predicción es ESPERAR."
    },
    takeProfit: {
      type: Type.STRING,
      description: "El precio objetivo para tomar ganancias. Omitir si la predicción es ESPERAR."
    },
    stopLoss: {
        type: Type.STRING,
        description: "El precio para cortar pérdidas. Omitir si la predicción es ESPERAR."
    }
  },
  required: ['prediction', 'justification']
};

export const analyzeMarketImages = async (
  higherTimeframeImg: ImageFile,
  lowerTimeframeImg: ImageFile
): Promise<AnalysisData> => {
  const fullPrompt = `Eres un analista de trading experto. Tu análisis se basa en identificar patrones fractales y movimientos de precios repetitivos entre dos temporalidades diferentes. Tu objetivo es proporcionar una señal de trading clara (BUY, SELL, o WAIT) y una justificación concisa. Además, identifica el nombre del activo financiero (ej. 'EUR/USD', 'BTC/USDT') que generalmente se encuentra en la esquina superior izquierda de las imágenes y devuélvelo. Para las señales de BUY o SELL, debes proporcionar niveles de Punto de Entrada, Take Profit y Stop Loss que cumplan con un ratio de beneficio/riesgo estricto de entre 1:2 y 1:3. Esto significa que la distancia entre el Punto de Entrada y el Take Profit debe ser entre 2 y 3 veces la distancia entre el Punto de Entrada y el Stop Loss. Basa tu análisis ÚNICAMENTE en la información visual de las imágenes.

Analiza las imágenes del gráfico de mercado proporcionadas. La primera imagen es la temporalidad mayor y la segunda es la temporalidad menor. Basado en el análisis fractal, proporciona una señal de trading. Identifica también el nombre del activo y inclúyelo en tu respuesta. Tu respuesta debe estar en formato JSON que coincida con el esquema proporcionado. Solo predice 'WAIT' si no hay patrones claros de alta probabilidad visibles. Para 'BUY' o 'SELL', calcula y proporciona los puntos de entrada, take profit y stop loss asegurando un ratio beneficio/riesgo entre 1:2 y 1:3.`;

  const higherTimeframePart = {
    inlineData: {
      mimeType: higherTimeframeImg.mimeType,
      data: higherTimeframeImg.base64,
    },
  };

  const lowerTimeframePart = {
    inlineData: {
      mimeType: lowerTimeframeImg.mimeType,
      data: lowerTimeframeImg.base64,
    },
  };

  const contents: Content[] = [{
      parts: [
          { text: fullPrompt },
          higherTimeframePart,
          lowerTimeframePart
      ]
  }];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      }
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
        throw new Error("La respuesta de la IA está vacía.");
    }

    const parsedResult = JSON.parse(jsonString);

    // Validate the prediction value
    if (!Object.values(Prediction).includes(parsedResult.prediction)) {
        throw new Error(`Valor de predicción inválido recibido de la API: ${parsedResult.prediction}`);
    }

    return {
        prediction: parsedResult.prediction as Prediction,
        assetName: parsedResult.assetName,
        justification: parsedResult.justification,
        entryPoint: parsedResult.entryPoint,
        takeProfit: parsedResult.takeProfit,
        stopLoss: parsedResult.stopLoss,
    };

  } catch (error) {
    console.error("Error llamando a la API de Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('JSON')) {
            throw new Error("No se pudo obtener una respuesta JSON válida de la IA. Por favor, inténtalo de nuevo.");
        }
         if (error.message.includes('vacía')) {
            throw new Error("La respuesta de la IA está vacía, puede que las imágenes no sean claras.");
        }
    }
    throw new Error("Fallo al analizar las imágenes. La IA puede estar experimentando problemas.");
  }
};