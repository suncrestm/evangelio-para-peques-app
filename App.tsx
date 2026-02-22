import React, { useState } from 'react';
import { Section, GospelMode } from './types';
import { PRAYERS } from './constants';
import { askTheAngel } from './services/gemini';

async function generarEvangelio(evangelio: string, edad: number) {
  const response = await fetch("/api/evangelio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ evangelio, edad })
  });

  if (!response.ok) {
    throw new Error("Error en API");
  }

  return await response.json();
}

const App: React.FC = () => {
  const [gospelInput, setGospelInput] = useState('');
  const [gospelResult, setGospelResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (mode: GospelMode) => {
    if (!gospelInput.trim()) {
      alert("Primero pega el Evangelio.");
      return;
    }

    setLoading(true);
    setGospelResult('');

    try {
      const data = await generarEvangelio(gospelInput, 7);

      if (mode === 'cuento') setGospelResult(data.cuento);
      if (mode === 'analogia') setGospelResult(data.analogia);
      if (mode === 'dibujo') setGospelResult(data.historia);
      if (mode === 'oracion') setGospelResult(data.oracion);

    } catch {
      setGospelResult("Hubo un problema. Intenta nuevamente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-10">

        <div className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold text-yellow-500">
            Evangelio para Peques
          </h1>
          <p className="text-blue-500 font-semibold">
            La Biblia explicada para niños
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-yellow-100">
          <textarea
            value={gospelInput}
            onChange={(e) => setGospelInput(e.target.value)}
            placeholder="Pega aquí el Evangelio..."
            className="w-full h-40 p-5 rounded-2xl border-2 border-yellow-200 focus:border-yellow-400 focus:outline-none resize-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleGenerate('cuento')} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition">
              Cuento
            </button>
            <button onClick={() => handleGenerate('analogia')} className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">
              Analogía
            </button>
            <button onClick={() => handleGenerate('dibujo')} className="bg-green-400 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition">
              Cuento + Dibujo
            </button>
            <button onClick={() => handleGenerate('oracion')} className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition">
              Oración
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-yellow-600 font-bold">
            Generando contenido...
          </div>
        )}

        {gospelResult && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-yellow-100 whitespace-pre-wrap leading-relaxed text-gray-700">
            {gospelResult}
          </div>
        )}

      </div>
    </div>
  );
};

export default App;