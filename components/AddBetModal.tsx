
import React, { useState, useEffect } from 'react';
import { Bet, BetStatus, Sport, Bankroll } from '../types';

interface AddBetModalProps {
  bankrolls: Bankroll[];
  activeBankrollId: string;
  onClose: () => void;
  onSubmit: (bet: Omit<Bet, 'id' | 'profit'> & { manualProfit?: number }) => void;
  initialData?: Bet;
}

const SPORTS: Sport[] = [
  'Fútbol', 
  'Baloncesto', 
  'Tenis', 
  'eSports', 
  'Béisbol', 
  'NFL', 
  'MMA', 
  'Ciclismo', 
  'F1', 
  'MotoGP', 
  'Boxeo', 
  'Caballos', 
  'Otros'
];

const AddBetModal: React.FC<AddBetModalProps> = ({ bankrolls, activeBankrollId, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bankrollId: activeBankrollId === 'all' ? (bankrolls[0]?.id || 'default') : activeBankrollId,
    bookmaker: 'Winamax',
    sport: 'Fútbol' as Sport,
    odds: 1.80,
    stake: 10,
    status: BetStatus.PENDING,
    description: '',
    manualProfit: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        bankrollId: initialData.bankrollId,
        bookmaker: initialData.bookmaker,
        sport: initialData.sport,
        odds: initialData.odds,
        stake: initialData.stake,
        status: initialData.status,
        description: initialData.description,
        manualProfit: initialData.profit || 0
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      manualProfit: formData.status === BetStatus.CASH_OUT ? formData.manualProfit : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(226,0,26,0.15)]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-transparent">
          <div>
            <h2 className="text-2xl font-black text-white italic">{initialData ? 'EDITAR' : 'NUEVA'} OPERACIÓN</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mt-1">Control de auditoría</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Casa de Apuestas</label>
              <input 
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#ffcc00]" 
                placeholder="Ej: Winamax, Bet365..." 
                value={formData.bookmaker} 
                onChange={(e) => setFormData({...formData, bookmaker: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mercado / Deporte</label>
              <select className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-4 text-sm font-bold text-white outline-none focus:border-[#e2001a]" value={formData.sport} onChange={(e) => setFormData({...formData, sport: e.target.value as Sport})}>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción del Pronóstico</label>
            <input className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-[#e2001a]" placeholder="Ej: Real Madrid Gana y +2.5 goles" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="bg-zinc-950 rounded-3xl border border-white/5 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Cuota</label>
                    <input type="number" step="0.01" className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-4 py-4 text-xl font-black text-white text-center" value={formData.odds} onChange={(e) => setFormData({...formData, odds: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Importe (Stake)</label>
                    <input type="number" className="w-full bg-zinc-900 border border-[#e2001a]/50 rounded-2xl px-4 py-4 text-xl font-black text-white text-center" value={formData.stake} onChange={(e) => setFormData({...formData, stake: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Estado Actual</label>
                    <select className="w-full h-[60px] bg-zinc-900 border border-white/5 rounded-2xl px-2 text-[10px] font-black text-white uppercase text-center outline-none focus:border-white/20" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as BetStatus})}>
                        <option value={BetStatus.PENDING}>⌛ PENDIENTE</option>
                        <option value={BetStatus.WON}>✅ Ganada</option>
                        <option value={BetStatus.LOST}>❌ Perdida</option>
                        <option value={BetStatus.CASH_OUT}>💰 CASH OUT</option>
                        <option value={BetStatus.REFUNDED}>🔄 REEMBOLSADA</option>
                        <option value={BetStatus.CANCELLED}>🚫 ANULADA</option>
                    </select>
                </div>
            </div>

            {formData.status === BetStatus.CASH_OUT && (
                <div className="pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fas fa-hand-holding-dollar"></i> Resultado del Cierre (€)
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl px-6 py-4 text-2xl font-black text-blue-400 text-center outline-none focus:border-blue-500/50" 
                                placeholder="Ej: 15.50 o -2.00"
                                value={formData.manualProfit} 
                                onChange={(e) => setFormData({...formData, manualProfit: parseFloat(e.target.value)})} 
                            />
                            <p className="text-[8px] text-blue-400/50 font-bold text-center mt-2 uppercase">Indica el beneficio neto (positivo si ganaste, negativo si cerraste en pérdida)</p>
                        </div>
                    </div>
                </div>
            )}
          </div>

          <button type="submit" className="w-full py-6 bg-gradient-to-r from-[#e2001a] to-[#920011] rounded-2xl text-xs font-black text-white shadow-2xl shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em]">
            {initialData ? 'GUARDAR ACTUALIZACIÓN' : 'REGISTRAR OPERACIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBetModal;
