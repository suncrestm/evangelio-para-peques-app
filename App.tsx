
import React, { useState } from 'react';
import { Section, GospelMode } from './types';
import { PRAYERS } from './constants';
import { generateGospelContent, askTheAngel, generateColoringImage } from './services/gemini';

// Components
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
  const [gospelImage, setGospelImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'angel', text: string }[]>([]);
  const [activePrayer, setActivePrayer] = useState<string | null>(null);

  const handleGenerateGospel = async (mode: GospelMode) => {
    if (!gospelInput.trim()) {
      alert("¡Oye! Primero pega aquí el Evangelio del domingo 😊");
      return;
    }
    setLoading(true);
    setGospelResult('');
    setGospelImage(null);
    
    try {
      const result = await generateGospelContent(gospelInput, mode);
      
      // Si el modo es dibujo, intentamos extraer la escena y generar la imagen
      if (mode === 'dibujo') {
        const sceneMatch = result.match(/\[ESCENA: (.*?)\]/);
        const cleanResult = result.replace(/\[ESCENA: .*?\]/, '').trim();
        setGospelResult(cleanResult);
        
        if (sceneMatch && sceneMatch[1]) {
          setImageLoading(true);
          const imageUrl = await generateColoringImage(sceneMatch[1]);
          setGospelImage(imageUrl);
          setImageLoading(false);
        }
      } else {
        setGospelResult(result);
      }
    } catch (error) {
      setGospelResult("¡Oh no! Hubo un problema en el cielo. ¡Vuelve a intentar! 🙏");
    }
    setLoading(false);
  };

  const handlePrint = () => {
    if (!gospelImage) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <body style="text-align:center; margin:0; padding:40px;">
            <h1 style="font-family: sans-serif; color: #EAB308;">Evangelio para Peques ✨</h1>
            <img src="${gospelImage}" style="max-width:100%; height:auto; border: 2px solid #eee;" />
            <p style="font-family: sans-serif; color: #666; margin-top: 20px;">¡A colorear con mucho amor! ❤️</p>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      win.document.close();
    }
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
        <div className="float-animation inline-block mb-2">
          <span className="text-6xl">✨</span>
        </div>
        <h1 className="text-4xl font-black text-yellow-500 tracking-tight">
          Evangelio para Peques
        </h1>
        <p className="text-blue-400 font-black mt-1 text-sm uppercase tracking-widest">¡La Biblia es una aventura! 🚀</p>
      </header>

      <main className="max-w-3xl mx-auto px-4 space-y-8">
        {section === Section.HOME && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📖</span>
                <h2 className="text-xl font-black text-blue-600">Pega el Evangelio aquí:</h2>
              </div>
              <textarea
                value={gospelInput}
                onChange={(e) => setGospelInput(e.target.value)}
                placeholder="Ejemplo: 'En aquel tiempo, Jesús dijo...'"
                className="w-full h-32 p-5 rounded-[2rem] bg-blue-50/50 border-4 border-dashed border-blue-100 focus:border-blue-400 focus:outline-none text-gray-700 font-bold resize-none transition-all"
              />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { mode: 'cuento', label: '¡Cuento Corto!', icon: '🏰', color: 'bg-orange-400' },
                  { mode: 'analogia', label: 'Analogía', icon: '🚀', color: 'bg-blue-400' },
                  { mode: 'dibujo', label: 'Cuento + Dibujo', icon: '🎨', color: 'bg-green-400' },
                  { mode: 'oracion', label: 'Oración Fácil', icon: '✨', color: 'bg-pink-400' }
                ].map((btn) => (
                  <button 
                    key={btn.mode}
                    onClick={() => handleGenerateGospel(btn.mode as GospelMode)}
                    className={`${btn.color} p-5 text-white rounded-[2rem] font-black shadow-lg hover:brightness-110 active:scale-95 transition-all flex flex-col items-center gap-1`}
                  >
                    <span className="text-3xl">{btn.icon}</span>
                    <span className="text-sm">{btn.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {loading && (
              <div className="text-center py-10 animate-bounce">
                <span className="text-7xl">🕊️</span>
                <p className="text-blue-500 font-black mt-4 uppercase tracking-widest">¡El Espíritu Santo está trabajando!...</p>
              </div>
            )}

            {gospelResult && (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <Card className="bg-white border-4 border-yellow-200">
                  <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-700 font-bold leading-relaxed">
                    {gospelResult}
                  </div>
                </Card>

                {imageLoading && (
                  <Card className="bg-white text-center py-12 border-4 border-dashed border-green-200">
                    <div className="animate-spin inline-block text-5xl mb-4">🎨</div>
                    <p className="text-green-600 font-black uppercase tracking-widest">¡Preparando tu lámina para colorear! ✨</p>
                  </Card>
                )}

                {gospelImage && (
                  <Card className="bg-white border-4 border-green-400 overflow-hidden text-center relative">
                    <div className="absolute top-4 right-4 bg-green-400 text-white px-4 py-1 rounded-full text-xs font-black uppercase shadow-lg">
                      ¡Tu dibujo! 🎨
                    </div>
                    <img 
                      src={gospelImage} 
                      alt="Dibujo para colorear" 
                      className="w-full h-auto rounded-xl border-2 border-gray-100 mb-6 bg-white"
                    />
                    <div className="flex gap-4 justify-center">
                      <button 
                        onClick={handlePrint}
                        className="bg-green-500 text-white px-8 py-4 rounded-full font-black shadow-xl hover:bg-green-600 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span>🖨️</span> ¡Imprimir y Colorear!
                      </button>
                    </div>
                  </Card>
                )}

                <div className="mt-8 pt-6 border-t-2 border-yellow-100 flex justify-center">
                  <button 
                    onClick={() => { setGospelResult(''); setGospelImage(null); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                    className="px-8 py-3 bg-gray-100 text-gray-500 rounded-full font-black text-sm uppercase"
                  >
                    🔄 ¡Hacer otro!
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {section === Section.PRAYERS && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-center text-pink-600 font-black text-3xl mb-6">Mis Rezos de Amor ❤️</h2>
            {PRAYERS.map(p => (
              <div key={p.id} className="space-y-2">
                <button
                  onClick={() => setActivePrayer(activePrayer === p.id ? null : p.id)}
                  className={`w-full flex items-center gap-4 p-6 rounded-[2.5rem] text-left transition-all ${
                    activePrayer === p.id 
                      ? 'bg-pink-500 text-white shadow-2xl scale-102' 
                      : 'bg-white text-gray-800 border-2 border-pink-50'
                  }`}
                >
                  <span className="text-4xl bg-white/20 p-3 rounded-2xl">{p.icon}</span>
                  <span className="font-black text-2xl flex-1">{p.title}</span>
                </button>
                {activePrayer === p.id && (
                  <Card className="bg-white border-4 border-pink-200">
                    <p className="text-3xl leading-relaxed text-gray-700 text-center font-black italic py-6">
                      {p.content}
                    </p>
                    <p className="text-center text-pink-400 font-black text-xs uppercase tracking-widest">¡Jesús te escucha siempre! ✨</p>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}

        {section === Section.CHAT && (
          <div className="flex flex-col h-[65vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-yellow-100 animate-in zoom-in-95">
            <div className="bg-yellow-400 p-6 flex items-center gap-4 text-white">
              <span className="text-5xl">👼</span>
              <div>
                <h3 className="font-black text-2xl">Angelito</h3>
                <p className="text-xs font-bold uppercase tracking-widest opacity-90">¡Pregúntame lo que quieras!</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-yellow-50/20">
              {chatMessages.length === 0 && (
                <div className="text-center py-10">
                  <span className="text-7xl mb-4 block">👋</span>
                  <p className="text-yellow-600 font-black text-2xl">¡Hola Peques!</p>
                  <p className="text-gray-400 font-bold px-10 mt-2">¿Quieres saber algo sobre Dios? ¡Aquí estoy para ayudarte!</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-6 rounded-[2.5rem] ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border-4 border-yellow-50'
                  }`}>
                    <p className="font-black text-lg">{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-6 rounded-[2.5rem] border-4 border-yellow-50 animate-pulse text-yellow-500 font-black">
                    ✨ Buscando en el cielo...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChat} className="p-4 bg-white border-t-4 border-yellow-50 flex gap-3 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe aquí..."
                className="flex-1 px-8 py-5 rounded-full bg-gray-100 focus:bg-white focus:outline-none text-gray-700 font-black text-xl"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-400 text-white w-16 h-16 rounded-full shadow-lg hover:bg-yellow-500 active:scale-90 transition-all flex items-center justify-center text-3xl disabled:opacity-50"
              >
                🚀
              </button>
            </form>
          </div>
        )}
      </main>

      <Navbar current={section} setSection={setSection} />
    </div>
  );
};

export default App;
