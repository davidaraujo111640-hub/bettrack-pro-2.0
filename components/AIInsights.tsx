
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bet } from '../types';

interface AIInsightsProps {
  bets: Bet[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ bets }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  React.useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(!!process.env.GEMINI_API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const generateInsights = async () => {
    if (bets.length < 3) return;
    
    // If we need a paid model and don't have a key, prompt for it
    if (!hasKey && window.aistudio) {
        await handleOpenKeySelector();
    }

    setIsLoading(true);
    setInsight(null);
    setSources([]);

    try {
      // Use GEMINI_API_KEY for free tier or API_KEY if selected
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("No API Key found. Please select an API key.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Actúa como un experto analista de apuestas profesional (Tipster Pro). 
      Analiza mi historial reciente de apuestas: ${JSON.stringify(bets.slice(0, 50))}. 
      
      Instrucciones:
      1. Evalúa el ROI y el Yield actual.
      2. Identifica patrones ganadores (deportes, cuotas o casas de apuestas donde soy más rentable).
      3. Señala errores críticos (ej: exceso de riesgo/stake, apuestas a cuotas sin valor).
      4. Usa la herramienta de búsqueda para darme consejos sobre eventos deportivos actuales que encajen con mi perfil.
      
      Responde en español con un tono motivador pero profesional. Usa formato Markdown con negritas y listas.`;

      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      // Correct: Access the response text property directly.
      const text = response.text;
      setInsight(text || "No se ha podido generar un análisis detallado en este momento.");
      
      // Always extract URLs from groundingChunks as per Search Grounding guidelines.
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      if (error.message?.includes("API Key") || error.message?.includes("API_KEY")) {
        setInsight("Error: La clave API no está configurada. Por favor, asegúrate de tener una clave válida.");
        if (window.aistudio) {
            setHasKey(false);
        }
      } else {
        setInsight("Lo siento, el Analista Pro está saturado. Por favor, inténtalo de nuevo en unos minutos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 px-4 md:px-0 pb-20">
      <header className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 gap-4">
        <div>
          <h2 className="text-3xl font-black italic text-white flex items-center gap-3">
            Analista <span className="text-[#ffcc00]">PRO AI</span>
          </h2>
          <p className="text-slate-500 text-sm font-bold mt-1">Análisis táctico basado en tus datos reales.</p>
        </div>
        <button 
          onClick={generateInsights} 
          disabled={isLoading || bets.length < 3} 
          className="w-full sm:w-auto bg-gradient-to-r from-[#e2001a] to-[#ffcc00] text-black font-black px-8 py-4 rounded-2xl disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-900/20"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Escaneando...</span>
            </div>
          ) : 'Generar Reporte Pro'}
        </button>
      </header>

      <div className="glass-panel p-8 lg:p-12 rounded-[2.5rem] border-[#ffcc00]/10 min-h-[400px] relative overflow-hidden">
        {isLoading && (
            <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 border-4 border-[#ffcc00]/20 border-t-[#ffcc00] rounded-full animate-spin"></div>
                <p className="mt-6 text-[#ffcc00] font-black uppercase tracking-widest text-xs animate-pulse">Calculando probabilidades y valor...</p>
            </div>
        )}

        {insight ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed prose-headings:text-white prose-strong:text-[#ffcc00] prose-p:mb-4">
              {insight.split('\n').map((line, i) => (
                <p key={i} className={line.startsWith('#') ? 'text-xl font-black text-white mt-6 mb-2' : ''}>
                  {line.replace(/^#+\s*/, '')}
                </p>
              ))}
            </div>
            
            {sources.length > 0 && (
              <div className="pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Fuentes de mercado consultadas</h4>
                <div className="flex flex-wrap gap-2">
                  {sources.map((src, i) => src.web && (
                    <a key={i} href={src.web.uri} target="_blank" rel="noreferrer" className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-white hover:bg-[#e2001a]/20 transition-all flex items-center gap-2">
                      <i className="fas fa-globe-europe"></i>
                      {src.web.title || 'Referencia externa'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-8 shadow-inner">
              <i className="fas fa-brain text-4xl text-zinc-700"></i>
            </div>
            <h3 className="text-xl font-black text-white italic mb-2">Potencia tu Bankroll con IA</h3>
            <p className="text-slate-500 font-bold text-sm max-w-xs leading-relaxed">
              {bets.length < 3 
                ? 'Registra al menos 3 apuestas para que pueda analizar tu estilo de juego.' 
                : 'Analizaré tu rendimiento y buscaré noticias que puedan afectar tus próximos pronósticos.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
