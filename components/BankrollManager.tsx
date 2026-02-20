
import React, { useState, useRef } from 'react';
import { Bankroll } from '../types';

interface BankrollManagerProps {
  bankrolls: Bankroll[];
  activeBankrollId: string;
  onUpdate: (banks: Bankroll[]) => void;
  onSelect: (id: string) => void;
}

const BankrollManager: React.FC<BankrollManagerProps> = ({ bankrolls, activeBankrollId, onUpdate, onSelect }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBank, setNewBank] = useState({ name: '', initialCapital: 1000 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newBank.name) return;
    onUpdate([...bankrolls, { id: Math.random().toString(36).substr(2, 9), ...newBank, color: '#e2001a' }]);
    setIsAdding(false);
  };

  const exportData = () => {
    const data = {
      bankrolls: JSON.parse(localStorage.getItem('bt_bankrolls') || '[]'),
      bets: JSON.parse(localStorage.getItem('bet_track_bets') || '[]'),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BetTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.bankrolls && data.bets) {
          if (window.confirm('¿Estás seguro? Esto reemplazará todos tus datos actuales.')) {
            localStorage.setItem('bt_bankrolls', JSON.stringify(data.bankrolls));
            localStorage.setItem('bet_track_bets', JSON.stringify(data.bets));
            window.location.reload();
          }
        } else {
          alert('El archivo no tiene el formato correcto de BetTrack.');
        }
      } catch (err) {
        alert('Error al leer el archivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 px-4 md:px-0 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#e2001a] font-bold text-xs uppercase tracking-[0.3em]">GESTIÓN</span>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Bankrolls</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-white/5 border border-white/5 text-slate-400 px-4 py-3 rounded-2xl font-black uppercase text-[10px] hover:text-white transition-all"
          >
            <i className="fas fa-file-import mr-2"></i> Importar
          </button>
          <button 
            onClick={exportData} 
            className="bg-white/5 border border-white/5 text-slate-400 px-4 py-3 rounded-2xl font-black uppercase text-[10px] hover:text-white transition-all"
          >
            <i className="fas fa-file-export mr-2"></i> Backup
          </button>
          <button 
            onClick={() => setIsAdding(true)} 
            className="bg-[#e2001a] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-[#c10016] transition-all shadow-lg shadow-red-900/20"
          >
            Añadir Nuevo
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Global Especial */}
        <button 
          onClick={() => onSelect('all')}
          className={`glass-panel rounded-[2rem] p-8 transition-all text-left flex flex-col relative group ${
            activeBankrollId === 'all' 
              ? 'border-[#e2001a] ring-2 ring-[#e2001a]/20 bg-[#e2001a]/5' 
              : 'border-white/5 hover:border-white/20'
          }`}
        >
          {activeBankrollId === 'all' && (
            <div className="absolute top-6 right-6 bg-[#e2001a] text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
              <i className="fas fa-check"></i> Activo
            </div>
          )}
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 mb-6 flex items-center justify-center text-xl font-black text-slate-400 group-hover:text-white transition-colors">
            <i className="fas fa-globe"></i>
          </div>
          <h3 className="text-xl font-black text-white">Global</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Visión consolidada</p>
          <p className="text-sm font-black text-zinc-400 mt-1">Todos los bankrolls unidos</p>
        </button>

        {bankrolls.map(bank => (
          <button 
            key={bank.id} 
            onClick={() => onSelect(bank.id)}
            className={`glass-panel rounded-[2rem] p-8 transition-all text-left flex flex-col relative group ${
              activeBankrollId === bank.id 
                ? 'border-[#e2001a] ring-2 ring-[#e2001a]/20 bg-[#e2001a]/5' 
                : 'border-white/5 hover:border-white/20'
            }`}
          >
            {activeBankrollId === bank.id && (
              <div className="absolute top-6 right-6 bg-[#e2001a] text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <i className="fas fa-check"></i> Activo
              </div>
            )}
            <div className={`w-12 h-12 rounded-2xl bg-[#e2001a] mb-6 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-red-900/30 group-hover:scale-110 transition-transform`}>
              {bank.name.charAt(0)}
            </div>
            <h3 className="text-xl font-black text-white">{bank.name}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Capital Inicial</p>
            <p className="text-3xl font-black text-white mt-1">{bank.initialCapital}€</p>
          </button>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] p-10 rounded-[2.5rem] w-full max-w-md border border-white/10">
            <h3 className="text-xl font-black text-white mb-6 uppercase">Nuevo Tipster / Bank</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                <input className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-[#e2001a]" placeholder="Ej: Estrategia Tenis" value={newBank.name} onChange={e => setNewBank({...newBank, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Capital Inicial</label>
                <input className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-[#e2001a]" type="number" placeholder="1000" value={newBank.initialCapital} onChange={e => setNewBank({...newBank, initialCapital: parseFloat(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-4 text-xs font-black text-slate-500">CANCELAR</button>
                <button onClick={handleAdd} className="flex-1 py-4 bg-[#e2001a] rounded-2xl text-xs font-black text-white">CREAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankrollManager;
