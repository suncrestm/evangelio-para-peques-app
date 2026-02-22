import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo se permite POST" });
  }

  try {
    const { evangelio, edad } = req.body;

    if (!evangelio || !edad) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const prompt = `
Toma el siguiente evangelio:

"${evangelio}"

Adáptalo para un niño de ${edad} años.

Devuelve únicamente un JSON válido con esta estructura exacta:

{
  "cuento": "...",
  "analogia": "...",
  "historia": "...",
  "oracion": "..."
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

    const text = response.choices[0].message.content;

    return res.status(200).json(JSON.parse(text));

  } catch (error) {
    console.error("ERROR REAL:", error);

    return res.status(500).json({
      error: "Error interno",
      detalle: error.message
    });
  }
}