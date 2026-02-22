import React, { useState, useMemo } from "react";

type Modo = "meditacion" | "analogia" | "dibujo" | "oracion";

export default function App() {
  const [gospelInput, setGospelInput] = useState("");
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [resultText, setResultText] = useState("");
  const [resultImage, setResultImage] = useState("");
  const [loading, setLoading] = useState(false);

  const ages = [
    { label: "4–6", value: 5 },
    { label: "7–9", value: 8 },
    { label: "10–12", value: 11 }
  ];

  const citation = useMemo(() => {
    const match = gospelInput.match(/\b(Mt|Mc|Lc|Jn)\s*\d+\s*,\s*\d+(?:\s*-\s*\d+)?/i);
    return match ? match[0] : "";
  }, [gospelInput]);

  const callAPI = async (modo: Modo) => {
    if (!gospelInput || !selectedAge) return;

    setLoading(true);

    const res = await fetch("/api/evangelio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evangelio: gospelInput,
        edad: selectedAge,
        modo
      })
    });

    const data = await res.json();

    if (modo === "analogia") setResultText(data.analogia || "");
    else if (modo === "oracion") setResultText(data.oracion || "");
    else setResultText(data.meditacion || "");

    setResultImage(data.image ? `data:image/png;base64,${data.image}` : "");
    setLoading(false);
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");

    win!.document.write(`
      <html>
        <head>
          <title>Meditación sobre el Evangelio</title>
          <style>
            @page { margin: 20mm; }
            body { font-family: Arial; }
            .logo { text-align:center; font-size:28px; font-weight:bold; color:#d19a00; }
            .subtitle { text-align:center; font-size:14px; margin-bottom:20px; }
            .cita { text-align:center; margin-bottom:20px; font-size:14px; color:#555; }
            .contenido { white-space:pre-wrap; line-height:1.7; font-size:16px; }
            img { width:100%; max-width:700px; display:block; margin:30px auto; }
            .footer { text-align:center; margin-top:40px; font-size:12px; color:#777; }
          </style>
        </head>
        <body>
          <div class="logo">Catolitips</div>
          <div class="subtitle">Material para papás y catequistas</div>
          <h2 style="text-align:center;">Meditación sobre el Evangelio</h2>
          <div class="cita">${citation}</div>
          <div class="contenido">${resultText}</div>
          ${resultImage ? `<img src="${resultImage}" />` : ""}
          <div class="footer">catolitips.org</div>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `);

    win!.document.close();
  };

  return (
    <div className="min-h-screen bg-[#fbf3de] py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-[#d19a00]">
          Evangelio para Peques
        </h1>
        <p className="text-center text-blue-600 mb-8">
          Para papás y catequistas
        </p>

        <div className="bg-white p-6 rounded-3xl shadow border border-yellow-200">
          <label className="font-semibold block mb-2">
            Pega el Evangelio aquí:
          </label>

          <textarea
            value={gospelInput}
            onChange={(e) => setGospelInput(e.target.value)}
            className="w-full h-40 p-4 rounded-2xl border border-yellow-300 focus:outline-none"
          />

          <div className="mt-4">
            <div className="font-semibold mb-2">Edad (obligatoria):</div>
            <div className="flex gap-3">
              {ages.map(a => (
                <button
                  key={a.value}
                  onClick={() => setSelectedAge(a.value)}
                  className={
                    "px-4 py-2 rounded-full border " +
                    (selectedAge === a.value
                      ? "bg-black text-white"
                      : "bg-white")
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => callAPI("meditacion")}
              className="bg-yellow-400 py-3 rounded-2xl font-bold"
            >
              Meditación
            </button>

            <button
              onClick={() => callAPI("analogia")}
              className="bg-blue-500 text-white py-3 rounded-2xl font-bold"
            >
              Analogía
            </button>

            <button
              onClick={() => callAPI("dibujo")}
              className="bg-green-500 text-white py-3 rounded-2xl font-bold"
            >
              Meditación + Dibujo
            </button>

            <button
              onClick={() => callAPI("oracion")}
              className="bg-pink-500 text-white py-3 rounded-2xl font-bold"
            >
              Oración
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-center mt-6 font-semibold">Generando...</p>
        )}

        {resultText && (
          <div className="bg-white p-6 mt-8 rounded-3xl shadow border border-yellow-200">
            <h2 className="text-xl font-bold mb-2">
              Meditación sobre el Evangelio
            </h2>

            {citation && (
              <p className="text-gray-500 mb-4">{citation}</p>
            )}

            <div className="whitespace-pre-wrap leading-relaxed">
              {resultText}
            </div>

            {resultImage && (
              <img
                src={resultImage}
                alt="Dibujo"
                className="mt-6 mx-auto max-w-full"
              />
            )}

            <button
              onClick={handlePrint}
              className="mt-6 bg-black text-white px-6 py-2 rounded-full"
            >
              Descargar PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}