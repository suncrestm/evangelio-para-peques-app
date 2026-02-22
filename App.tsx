import React, { useState } from "react";

type Mode = "cuento" | "analogia" | "dibujo" | "oracion";

export default function App() {
  const [gospelInput, setGospelInput] = useState("");
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultText, setResultText] = useState("");
  const [resultImage, setResultImage] = useState<string | null>(null);

  const ages = [
    { label: "4–6", value: 5 },
    { label: "7–9", value: 8 },
    { label: "10–12", value: 11 },
  ];

  async function handleGenerate(mode: Mode) {
    if (!gospelInput.trim()) {
      alert("Pega el Evangelio primero.");
      return;
    }

    if (!selectedAge) {
      alert("Selecciona una edad.");
      return;
    }

    setLoading(true);
    setResultText("");
    setResultTitle("");
    setResultImage(null);

    try {
      const res = await fetch("/api/evangelio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evangelio: gospelInput, edad: selectedAge }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Error API");

      if (mode === "cuento") {
        setResultTitle("Cuento");
        setResultText(data.cuento);
      }

      if (mode === "analogia") {
        setResultTitle("Analogía");
        setResultText(data.analogia);
      }

      if (mode === "oracion") {
        setResultTitle("Oración");
        setResultText(data.oracion);
      }

	  if (mode === "dibujo") {
		console.log("Respuesta completa backend:", data);

		setResultTitle("Cuento + Dibujo");
		setResultText(data.historia);

	  if (data.image) {
		setResultImage(`data:image/png;base64,${data.image}`);
      } else {
		console.log("No llegó imagen desde backend");
	  }
}

    } catch (err) {
      console.error(err);
      alert("Hubo un error.");
    }

    setLoading(false);
  }

  async function handleCopy() {
    if (!resultText) return;

    await navigator.clipboard.writeText(
      resultText + "\n\nRecurso gratuito de Catolitips.org"
    );

    alert("Contenido copiado.");
  }

  function handlePrint() {
    if (!resultImage) return;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <body style="text-align:center; font-family:sans-serif; padding:40px;">
          <h2>${resultTitle}</h2>
          <p style="white-space:pre-wrap;">${resultText}</p>
          <img src="${resultImage}" style="max-width:100%; margin-top:20px;" />
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    win.document.close();
  }

  return (
    <div className="min-h-screen bg-[#fbf6e8] px-4 py-10">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl font-extrabold text-[#e0a100] text-center">
          Evangelio para Peques
        </h1>
        <p className="text-center text-blue-600 mt-2">
          Para papás y catequistas
        </p>

        <div className="bg-white rounded-3xl shadow-lg border border-yellow-200 p-6 mt-8">

          <textarea
            value={gospelInput}
            onChange={(e) => setGospelInput(e.target.value)}
            className="w-full h-40 p-4 rounded-2xl border border-yellow-300"
            placeholder="Pega el texto del Evangelio..."
          />

          <div className="mt-4">
            <p className="font-semibold">Edad (obligatoria):</p>
            <div className="flex gap-3 mt-2">
              {ages.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setSelectedAge(a.value)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedAge === a.value
                      ? "bg-black text-white"
                      : "bg-white text-gray-700"
                  }`}
                  type="button"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handleGenerate("cuento")}
              className="bg-yellow-400 text-black rounded-2xl py-4 font-bold"
            >
              Cuento
            </button>

            <button
              onClick={() => handleGenerate("analogia")}
              className="bg-blue-500 text-white rounded-2xl py-4 font-bold"
            >
              Analogía
            </button>

            <button
              onClick={() => handleGenerate("dibujo")}
              className="bg-green-500 text-white rounded-2xl py-4 font-bold"
            >
              Cuento + Dibujo
            </button>

            <button
              onClick={() => handleGenerate("oracion")}
              className="bg-pink-500 text-white rounded-2xl py-4 font-bold"
            >
              Oración
            </button>
          </div>
        </div>

        {(resultText || loading) && (
          <div className="bg-white rounded-3xl shadow-lg border border-yellow-200 p-6 mt-8">

            {loading ? (
              <p>Generando...</p>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-3">{resultTitle}</h2>
                <div className="whitespace-pre-wrap">{resultText}</div>

                {resultImage && (
                  <div className="mt-6 text-center">
                    <img
                      src={resultImage}
                      alt="Dibujo"
                      className="max-w-full"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-900 text-white rounded-full"
                  >
                    Copiar contenido
                  </button>

                  {resultImage && (
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-green-600 text-white rounded-full"
                    >
                      Imprimir lámina
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}