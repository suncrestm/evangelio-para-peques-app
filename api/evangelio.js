import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function countWords(text) {
  return text.trim().split(/\s+/).length;
}

async function generarContenido(evangelio, edad) {
  const prompt = `
Toma el siguiente evangelio:

"${evangelio}"

Adáptalo para un niño de ${edad} años.

REGLAS OBLIGATORIAS:

- El cuento debe tener mínimo 500 palabras.
- Debe tener entre 5 y 8 párrafos.
- Cada párrafo debe tener al menos 4 oraciones.
- Incluye diálogos con comillas.
- Describe emociones, ambiente y acciones.
- No hagas resumen.
- No hagas moraleja corta.
- Debe parecer un cuento infantil completo.
- Español claro y natural para México.
- Sin emojis.

Devuelve únicamente un JSON válido con esta estructura exacta:

{
  "cuento": "...",
  "analogia": "...",
  "historia": "...",
  "oracion": "...",
  "escena": "Describe brevemente una escena visual clara para un dibujo infantil en blanco y negro para colorear."
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: "Eres un catequista experto que explica el evangelio a niños."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  const text = response.choices[0].message.content;
  return JSON.parse(text);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo se permite POST" });
  }

  try {
    const { evangelio, edad } = req.body;

    if (!evangelio || !edad) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    // --------- GENERAR TEXTO (con validación de longitud) ---------
    let parsed = await generarContenido(evangelio, edad);

    // Si el cuento sale corto, intentamos una vez más
    if (!parsed.cuento || countWords(parsed.cuento) < 450) {
      parsed = await generarContenido(evangelio, edad);
    }

    // ---------- GENERAR IMAGEN ----------
    let imageBase64 = null;

    if (parsed.escena) {
      try {
        const image = await client.images.generate({
          model: "gpt-image-1",
          prompt: `
Ilustración cristiana estilo libro para colorear.
Solo líneas negras.
Sin colores.
Fondo blanco.
Contornos gruesos y claros.
Estilo catequético.
Escena: ${parsed.escena}
          `,
          size: "1024x1024"
        });

        if (image?.data?.[0]?.b64_json) {
          imageBase64 = image.data[0].b64_json;
        }

      } catch (imgError) {
        console.error("ERROR GENERANDO IMAGEN:", imgError);
      }
    }

    return res.status(200).json({
      ...parsed,
      image: imageBase64
    });

  } catch (error) {
    console.error("ERROR REAL:", error);

    return res.status(500).json({
      error: "Error interno",
      detalle: error.message
    });
  }
}