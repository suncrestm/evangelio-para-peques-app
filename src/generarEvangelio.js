import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generarEvangelio({ evangelio, edad }) {

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

Reglas:
- Fidelidad total al texto bíblico
- Lenguaje adecuado a la edad
- No inventar doctrinas
- No agregar texto fuera del JSON
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

  return JSON.parse(text);
}