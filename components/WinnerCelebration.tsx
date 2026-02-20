
import React, { useEffect } from 'react';

interface WinnerCelebrationProps {
  onClose: () => void;
}

const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({ onClose }) => {
  useEffect(() => {
    // Auto-cierre más rápido para mantener la agilidad de la app
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Fondo con flash de victoria */}
      <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-md animate-victory-flash pointer-events-auto" onClick={onClose}></div>
      
      {/* Lluvia de Confeti Masiva (CSS puro) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full animate-confetti-fast"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              width: `${Math.random() * 15 + 8}px`,
              height: `${Math.random() * 15 + 8}px`,
              backgroundColor: ['#e2001a', '#ffcc00', '#10b981', '#3b82f6', '#ffffff'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 1.5 + 1}s`,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          ></div>
        ))}
      </div>

      {/* Contenido Central: Tipografía 3D Explosiva */}
      <div className="relative z-10 flex flex-col items-center animate-bounce-in">
        <div className="relative">
          {/* Brillo detrás del texto */}
          <div className="absolute inset-0 bg-emerald-500 blur-[100px] opacity-40 animate-pulse"></div>
          
          <h2 className="text-[120px] md:text-[200px] font-black italic tracking-tighter leading-none select-none
                         text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-700
                         drop-shadow-[0_20px_50px_rgba(16,185,129,0.5)] transform -skew-x-12">
            ¡GREEN!
          </h2>
          
          <div className="flex items-center justify-center gap-6 -mt-4">
             <div className="h-1 flex-1 bg-gradient-to-r from-transparent to-emerald-500 rounded-full"></div>
             <p className="text-white text-2xl md:text-3xl font-black uppercase tracking-[0.6em] animate-pulse">
               WINNER
             </p>
             <div className="h-1 flex-1 bg-gradient-to-l from-transparent to-emerald-500 rounded-full"></div>
          </div>
        </div>

        {/* Iconos de celebración flotantes */}
        <div className="mt-12 flex gap-8">
            <i className="fas fa-trophy text-6xl text-[#ffcc00] animate-bounce-custom-1"></i>
            <i className="fas fa-money-bill-trend-up text-6xl text-emerald-400 animate-bounce-custom-2"></i>
            <i className="fas fa-crown text-6xl text-[#ffcc00] animate-bounce-custom-3"></i>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes victory-flash {
          0% { background-color: rgba(16, 185, 129, 0.4); backdrop-filter: blur(0px); }
          100% { background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(12px); }
        }
        @keyframes confetti-fast {
          0% { transform: translateY(0) rotate(0) scale(1); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-victory-flash { animation: victory-flash 0.5s forwards; }
        .animate-confetti-fast { animation: confetti-fast linear infinite; }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-bounce-custom-1 { animation: bounce-custom 1s infinite ease-in-out; }
        .animate-bounce-custom-2 { animation: bounce-custom 1s infinite ease-in-out 0.2s; }
        .animate-bounce-custom-3 { animation: bounce-custom 1s infinite ease-in-out 0.4s; }
      `}} />
    </div>
  );
};

export default WinnerCelebration;
