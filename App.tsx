import { useState } from "react";

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
    { label: "10–12", value: 11 }
  ];

  const generateContent = async (type: string) => {
    if (!gospelInput || !selectedAge) {
      alert("Pega el Evangelio y elige una edad.");
      return;
    }

    setLoading(true);
    setResultText("");
    setResultImage(null);

    try {
      const response = await fetch("/api/evangelio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evangelio: gospelInput,
          edad: selectedAge
        })
      });

      const data = await response.json();

      if (type === "cuento") {
        setResultTitle("Cuento");
        setResultText(data.cuento);
      }

      if (type === "analogia") {
        setResultTitle("Analogía");
        setResultText(data.analogia);
      }

      if (type === "oracion") {
        setResultTitle("Oración");
        setResultText(data.oracion);
      }

      if (type === "cuentoDibujo") {
        setResultTitle("Cuento + Dibujo");
        setResultText(data.cuento);
        setResultImage(data.image);
      }

    } catch (error) {
      console.error(error);
      alert("Ocurrió un error.");
    }

    setLoading(false);
  };

  const handleCopy = async () => {
    if (!resultText) return;

    await navigator.clipboard.writeText(resultText);
    alert("Contenido copiado.");
  };

const handlePrint = () => {
  if (!resultText) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  const imageHTML = resultImage
    ? `<img src="data:image/png;base64,${resultImage}" style="width:100%; margin-top:20px;" />`
    : "";

  printWindow.document.write(`
    <html>
      <head>
        <title>Evangelio para Peques</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
          }
          h1 {
            text-align: center;
            margin-bottom: 30px;
          }
          .cuento {
            white-space: pre-wrap;
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <h1>${resultTitle}</h1>
        <div class="cuento">${resultText}</div>
        ${imageHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
  return (
    <div className="min-h-screen bg-[#f4efe6] py-10 px-4">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-yellow-600 mb-2">
          Evangelio para Peques
        </h1>

        <p className="text-center text-blue-600 mb-8">
          Para papás y catequistas
        </p>

        {/* Input */}
        <div className="bg-white rounded-3xl shadow-lg border border-yellow-200 p-6">

          <label className="block font-semibold mb-2">
            Pega el Evangelio aquí:
          </label>

          <textarea
            value={gospelInput}
            onChange={(e) => setGospelInput(e.target.value)}
            className="w-full border border-yellow-400 rounded-xl p-4 mb-6 h-40"
            placeholder="Pega el texto del Evangelio..."
          />

          <p className="font-semibold mb-2">
            Edad (obligatoria):
          </p>

          <div className="flex gap-3 mb-6">
            {ages.map((age) => (
              <button
                key={age.value}
                onClick={() => setSelectedAge(age.value)}
                className={`px-4 py-2 rounded-full border ${
                  selectedAge === age.value
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => generateContent("cuento")}
              className="bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow"
            >
              Cuento
            </button>

            <button
              onClick={() => generateContent("analogia")}
              className="bg-blue-500 text-white font-semibold py-3 rounded-xl shadow"
            >
              Analogía
            </button>

            <button
              onClick={() => generateContent("cuentoDibujo")}
              className="bg-green-600 text-white font-semibold py-3 rounded-xl shadow"
            >
              Cuento + Dibujo
            </button>

            <button
              onClick={() => generateContent("oracion")}
              className="bg-pink-500 text-white font-semibold py-3 rounded-xl shadow"
            >
              Oración
            </button>

          </div>

        </div>

        {/* Resultado */}
        {loading && (
          <p className="text-center mt-6 font-semibold">
            Generando...
          </p>
        )}

        {resultText && (
          <div className="print-area bg-white mt-8 rounded-3xl shadow-lg border border-yellow-200 p-6">

            <h2 className="text-xl font-bold mb-4">
              {resultTitle}
            </h2>

            <div className="whitespace-pre-wrap leading-relaxed mb-6">
              {resultText}
            </div>

            {resultImage && (
              <div className="mb-6">
                <img
                  src={`data:image/png;base64,${resultImage}`}
                  alt="Dibujo"
                  className="w-full rounded-xl"
                />
              </div>
            )}

            <div className="flex gap-4 justify-end">

              <button
                onClick={handleCopy}
                className="bg-black text-white px-5 py-2 rounded-full"
              >
                Copiar contenido
              </button>

              {resultImage && (
                <button
                  onClick={handlePrint}
                  className="bg-green-600 text-white px-5 py-2 rounded-full"
                >
                  Imprimir dibujo
                </button>
              )}

            </div>

          </div>
        )}

      </div>

      {/* CSS de impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .print-area, .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

    </div>
  );
}