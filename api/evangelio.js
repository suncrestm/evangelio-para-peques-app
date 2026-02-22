import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function reglasPorEdad(edad) {
  if (edad <= 6) {
    return `
- Longitud entre 180 y 250 palabras.
- 3 o 4 párrafos cortos.
- Lenguaje muy simple.
`;
  }

  if (edad <= 9) {
    return `
- Longitud entre 300 y 400 palabras.
- 4 a 6 párrafos.
`;
  }

  return `
- Longitud entre 450 y 600 palabras.
- 5 a 8 párrafos.
`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo se permite POST" });
  }

  try {
    const { evangelio, edad, modo } = req.body;

    if (!evangelio || !edad) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const prompt = `
Toma el siguiente evangelio:

"${evangelio}"

Adáptalo para un niño de ${edad} años.

${reglasPorEdad(edad)}

REGLAS GENERALES:
- Español natural para México.
- Incluye algunos diálogos.
- Describe emociones.
- No hagas resumen teológico.
- Sin emojis.

Devuelve SOLO JSON con esta estructura exacta:

{
  "meditacion": "...",
  "analogia": "...",
  "oracion": "...",
  "escena": "Descripción breve para dibujo infantil en blanco y negro."
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
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

    const parsed = JSON.parse(response.choices[0].message.content);

    let imageBase64 = null;

    // 🔥 SOLO GENERAR IMAGEN SI EL MODO ES DIBUJO
    if (modo === "dibujo" && parsed.escena) {
      try {
        const image = await client.images.generate({
          model: "gpt-image-1",
          prompt: `
Ilustración cristiana estilo libro para colorear.
Solo líneas negras.
Sin colores.
Fondo blanco.
Contornos gruesos.
Escena: ${parsed.escena}
          `,
          size: "1024x1024"
        });

        if (image?.data?.[0]?.b64_json) {
          imageBase64 = image.data[0].b64_json;
        }
      } catch (imgError) {
        console.error("Error generando imagen:", imgError);
      }
    }

    return res.status(200).json({
      meditacion: parsed.meditacion,
      analogia: parsed.analogia,
      oracion: parsed.oracion,
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