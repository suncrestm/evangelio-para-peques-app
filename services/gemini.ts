
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Eres un asistente católico especializado en explicar el Evangelio de la Misa dominical a niños de 5 a 8 años, de forma divertida, sencilla y fiel a la enseñanza de la Iglesia Católica. Tu nombre es "Evangelio para Peques". Siempre responde en español, con lenguaje muy simple: palabras cortas, repeticiones, rimas si encaja, y ejemplos de la vida cotidiana (familia, juguetes, animales, aventuras).
Usa emojis 😊, ⭐, 🚀, negritas para títulos y listas numeradas.
Reglas:
- Siempre fiel al texto del Evangelio.
- Positivo, alegre y esperanzador: Dios es como un superpapá.
- Corto y atractivo: los niños se aburren rápido.
- Si hay algo difícil, explícalo como "un rey malo" o "un problema" pero resalta que Dios protege.`;

export const generateGospelContent = async (text: string, mode: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let modePrompt = "";
  switch (mode) {
    case 'cuento':
      modePrompt = "Genera un ¡Cuento Corto!: Un cuento breve (1-2 párrafos, máx 150 palabras) que reescribe el Evangelio como una aventura divertida. Empieza con '¡Érase una vez...' o '¡Imagina una aventura increíble...'.";
      break;
    case 'analogia':
      modePrompt = "Genera una ¡Analogía Divertida!: Una comparación sencilla (1-3 frases cortas) con algo de la vida diaria: familia, juegos, animales, escuela, superhéroes.";
      break;
    case 'dibujo':
      modePrompt = "Genera una ¡Historia con Dibujo!: Primero, un cuento (3-5 párrafos cortos, máx 250 palabras) con inicio, aventura y final feliz. IMPORTANTE: Al final del texto, añade una línea que diga '[ESCENA: descripcion detallada de la escena para dibujar]' donde describas brevemente la imagen central para que yo pueda generarla.";
      break;
    case 'oracion':
      modePrompt = "Genera una Oración Fácil: Una oración corta y rimada (4-8 líneas) para rezar en familia, fácil de repetir. Termina con 'Amén'.";
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Texto del Evangelio: ${text}\n\nInstrucción específica: ${modePrompt}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });

  return response.text || "¡Uy! Un angelito cerró el libro sin querer. 😊";
};

export const generateColoringImage = async (sceneDescription: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imagePrompt = `Coloring page for children, black and white line art, clear thick outlines, simple shapes, white background, no grayscale, no shading, very simple for 5 year old kids. Subject: ${sceneDescription}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const askTheAngel = async (question: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: question,
    config: {
      systemInstruction: "Eres 'Angelito', el guía de 'Evangelio para Peques'. Eres amable, usas muchos emojis y explicas las cosas como si fueran juegos o cuentos."
    }
  });
  return response.text || "¡Hola! ✨";
};
