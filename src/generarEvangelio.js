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
- No agregar moralejas modernas
- Mantener enfoque cristiano claro
- No usar markdown
- No usar bloques de código
- No agregar texto fuera del JSON
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    text: {
      format: {
        type: "json_object"
      }
    }
  });

  const text = response.output[0].content[0].text;

  return JSON.parse(text);
}
