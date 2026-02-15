import { generarEvangelio } from "../src/generarEvangelio.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo se permite POST" });
  }

  try {
    const { evangelio, edad } = req.body;

    if (!evangelio || !edad) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const resultado = await generarEvangelio({ evangelio, edad });

    return res.status(200).json(resultado);

  }catch (error) {
  console.error("ERROR REAL:", error);
  return res.status(500).json({
    error: "Error interno",
    detalle: error.message
  });
}

}
