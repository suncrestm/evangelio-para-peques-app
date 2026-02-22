import React, { useState } from 'react';
import { Section, GospelMode } from './types';
import { PRAYERS } from './constants';
import { askTheAngel, generateColoringImage } from './services/gemini';

// 🔹 NUEVA FUNCIÓN QUE LLAMA A TU API
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

const Navbar = ({ current, setSection }: { current: Section, setSection: (s: Section) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-yellow-100 px-4 py-3 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b-4">
    {[
      { id: Section.HOME, icon: '🏠', label: 'Inicio' },
      { id: Section.PRAYERS, icon: '🙏', label: 'Rezar' },
      { id: Section.CHAT, icon: '👼', label: 'Angelito' }
    ].map(item => (
      <button
        key={item.id}
        onClick={() => setSection(item.id)}
        className={`flex flex-col items-center px-4 py-2 rounded-[1.5rem] transition-all duration-300 ${
          current === item.id ? 'bg-yellow-400 text-white scale-110 shadow-lg' : 'text-gray-400'
        }`}
      >
        <span className="text-2xl">{item.icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
      </button>
    ))}
  </nav>
);

const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[2.5rem] p-6 kids-shadow border-2 border-gray-50 ${className}`}>
    {children}
  </div>
);

const App: React.FC = () => {
  const [section, setSection] = useState<Section>(Section.HOME);
  const [gospelInput, setGospelInput] = useState('');
  const [gospelResult, setGospelResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'angel', text: string }[]>([]);
  const [activePrayer, setActivePrayer] = useState<string | null>(null);

  const handleGenerateGospel = async (mode: GospelMode) => {
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

    } catch (error) {
      setGospelResult("¡Oh no! Hubo un problema en el cielo. Vuelve a intentar.");
    }

    setLoading(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);

    const reply = await askTheAngel(userMsg);
    setChatMessages(prev => [...prev, { role: 'angel', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-28 md:pt-24">
      <header className="p-8 text-center">
        <h1 className="text-4xl font-black text-yellow-500 tracking-tight">
          Evangelio para Peques
        </h1>
        <p className="text-blue-400 font-black mt-1 text-sm uppercase tracking-widest">
          ¡La Biblia es una aventura!
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 space-y-8">
        {section === Section.HOME && (
          <div className="space-y-6">
            <Card>
              <textarea
                value={gospelInput}
                onChange={(e) => setGospelInput(e.target.value)}
                placeholder="Pega el Evangelio aquí..."
                className="w-full h-32 p-5 rounded-[2rem] bg-blue-50 border-2 border-blue-200 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { mode: 'cuento', label: 'Cuento' },
                  { mode: 'analogia', label: 'Analogía' },
                  { mode: 'dibujo', label: 'Cuento + Dibujo' },
                  { mode: 'oracion', label: 'Oración' }
                ].map((btn) => (
                  <button 
                    key={btn.mode}
                    onClick={() => handleGenerateGospel(btn.mode as GospelMode)}
                    className="bg-yellow-400 p-4 rounded-2xl font-black"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </Card>

            {loading && <p className="text-center">Generando...</p>}

            {gospelResult && (
              <Card>
                <div className="whitespace-pre-wrap">
                  {gospelResult}
                </div>
              </Card>
            )}
          </div>
        )}

        {section === Section.PRAYERS && (
          <div>
            {PRAYERS.map(p => (
              <div key={p.id}>{p.title}</div>
            ))}
          </div>
        )}

        {section === Section.CHAT && (
          <div>
            {chatMessages.map((msg, idx) => (
              <div key={idx}>{msg.text}</div>
            ))}
          </div>
        )}
      </main>

      <Navbar current={section} setSection={setSection} />
    </div>
  );
};

export default App;