import React, { useState, useMemo } from "react";

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

  const callAPI = async (modo: string) => {
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

    if (modo === "analogia") {
      setResultText(data.analogia || "");
    } else if (modo === "oracion") {
      setResultText(data.oracion || "");
    } else {
      setResultText(data.meditacion || "");
    }

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
    <div style={{ padding: 40, maxWidth: 800, margin: "auto" }}>
      <h1 style={{ color: "#d19a00" }}>Evangelio para Peques</h1>

      <textarea
        value={gospelInput}
        onChange={(e) => setGospelInput(e.target.value)}
        placeholder="Pega el Evangelio aquí..."
        style={{ width: "100%", height: 150, marginBottom: 20 }}
      />

      <div style={{ marginBottom: 20 }}>
        {ages.map(a => (
          <button
            key={a.value}
            onClick={() => setSelectedAge(a.value)}
            style={{
              marginRight: 10,
              padding: "8px 15px",
              background: selectedAge === a.value ? "black" : "#eee",
              color: selectedAge === a.value ? "white" : "black"
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      <button onClick={() => callAPI("meditacion")} style={{ marginRight: 10 }}>
        Meditación
      </button>

      <button onClick={() => callAPI("analogia")} style={{ marginRight: 10 }}>
        Analogía
      </button>

      <button onClick={() => callAPI("dibujo")} style={{ marginRight: 10 }}>
        Meditación + Dibujo
      </button>

      <button onClick={() => callAPI("oracion")}>
        Oración
      </button>

      <button onClick={handlePrint} style={{ marginLeft: 20 }}>
        Descargar PDF
      </button>

      {loading && <p>Generando...</p>}

      {resultText && (
        <div style={{ marginTop: 40 }}>
          <h2>Meditación sobre el Evangelio</h2>
          {citation && <p><strong>{citation}</strong></p>}
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {resultText}
          </div>
          {resultImage && (
            <img
              src={resultImage}
              alt="Dibujo"
              style={{ width: "100%", marginTop: 20 }}
            />
          )}
        </div>
      )}
    </div>
  );
}