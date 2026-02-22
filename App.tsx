import React, { useState } from "react";

type Mode = "cuento" | "analogia" | "dibujo" | "oracion";

export default function App() {
  const [gospelInput, setGospelInput] = useState("");
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [resultTitle, setResultTitle] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");

  const ages = [
    { label: "4–6", value: 5 },
    { label: "7–9", value: 8 },
    { label: "10–12", value: 11 },
  ];

  const modeButtons: { mode: Mode; label: string; className: string }[] = [
    { mode: "cuento", label: "Cuento", className: "bg-yellow-400 text-white" },
    { mode: "analogia", label: "Analogía", className: "bg-blue-500 text-white" },
    { mode: "dibujo", label: "Cuento + Dibujo", className: "bg-green-500 text-white" },
    { mode: "oracion", label: "Oración", className: "bg-pink-500 text-white" },
  ];

  function pickTextByMode(apiJson: any, mode: Mode): string {
    if (!apiJson || typeof apiJson !== "object") return "";

    if (mode === "cuento") return apiJson.cuento ?? "";
    if (mode === "analogia") return apiJson.analogia ?? "";
    if (mode === "dibujo") return apiJson.historia ?? ""; // “historia” = cuento más largo/para dibujo
    if (mode === "oracion") return apiJson.oracion ?? "";

    return "";
  }

  async function handleGenerate(mode: Mode) {
    // Validación 1: evangelio
    if (!gospelInput.trim()) {
      alert("Pega el Evangelio primero.");
      return;
    }

    // Validación 2: edad obligatoria
    if (!selectedAge) {
      alert("Selecciona una edad antes de generar el contenido.");
      return;
    }

    setLoading(true);
    setResultTitle("");
    setResultText("");

    try {
      const res = await fetch("/api/evangelio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evangelio: gospelInput, edad: selectedAge }),
      });

      if (!res.ok) {
        const maybe = await res.json().catch(() => null);
        console.error("API ERROR:", maybe);
        throw new Error("Error en API");
      }

      const data = await res.json();

      const text = pickTextByMode(data, mode);
      if (!text) {
        console.error("Respuesta API sin texto esperado:", data);
        throw new Error("Respuesta incompleta");
      }

      const title =
        mode === "cuento"
          ? "Cuento"
          : mode === "analogia"
          ? "Analogía"
          : mode === "dibujo"
          ? "Cuento + Dibujo"
          : "Oración";

      setResultTitle(title);
      setResultText(text);
    } catch (err) {
      console.error("ERROR:", err);
      setResultTitle("Error");
      setResultText("¡Oh no! Hubo un problema en el cielo. Vuelve a intentar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf6e8] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-[#e0a100]">Evangelio para Peques</h1>
          <p className="mt-2 text-blue-600 font-medium">Para papás y catequistas</p>
        </header>

        <div className="bg-white rounded-3xl shadow-lg border border-yellow-200 p-6">
          <label className="block font-semibold text-gray-700 mb-2">
            Pega el Evangelio aquí:
          </label>

          <textarea
            value={gospelInput}
            onChange={(e) => setGospelInput(e.target.value)}
            className="w-full h-40 p-4 rounded-2xl border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Pega el texto del Evangelio..."
          />

          {/* Edad obligatoria */}
          <div className="mt-5">
            <p className="font-semibold text-gray-700 mb-2">Edad (obligatoria):</p>
            <div className="flex gap-3 flex-wrap">
              {ages.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setSelectedAge(a.value)}
                  className={`px-4 py-2 rounded-full border transition ${
                    selectedAge === a.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                  }`}
                  type="button"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {modeButtons.map((b) => (
              <button
                key={b.mode}
                onClick={() => handleGenerate(b.mode)}
                disabled={loading}
                className={`${b.className} rounded-2xl py-4 font-bold shadow-md hover:opacity-95 disabled:opacity-50`}
                type="button"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado */}
        <div className="mt-8 bg-white rounded-3xl shadow-lg border border-yellow-200 p-6">
          {loading ? (
            <p className="text-center font-semibold text-gray-600">Generando…</p>
          ) : resultText ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-3">{resultTitle}</h2>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {resultText}
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              Elige una edad, pega el Evangelio y presiona un botón.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}