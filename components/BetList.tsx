
import React, { useState, useMemo } from 'react';
import { Bet, BetStatus } from '../types';
import { getSportIcon } from './Dashboard';

interface BetListProps {
  bets: Bet[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: BetStatus, profit?: number) => void;
  onEdit: (bet: Bet) => void;
}

const formatStatusText = (status: BetStatus): string => {
  switch (status) {
    case BetStatus.WON: return 'Ganada';
    case BetStatus.LOST: return 'Perdida';
    case BetStatus.PENDING: return 'Pendiente';
    case BetStatus.CASH_OUT: return 'CASH OUT';
    case BetStatus.REFUNDED: return 'REEMBOLSADA';
    case BetStatus.CANCELLED: return 'ANULADA';
    default: return status;
  }
};

const BetList: React.FC<BetListProps> = ({ bets, onDelete, onUpdateStatus, onEdit }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bookmakerFilter, setBookmakerFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [betToDelete, setBetToDelete] = useState<string | null>(null);

  // Extraer casas únicas de las apuestas actuales para el filtro
  const availableBookmakers = useMemo(() => {
    const books = new Set(bets.map(b => b.bookmaker).filter(Boolean));
    return Array.from(books).sort();
  }, [bets]);

  const filteredBets = useMemo(() => {
    return bets.filter(b => {
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchesBookmaker = bookmakerFilter === 'ALL' || b.bookmaker === bookmakerFilter;
      const matchesSearch = b.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            b.bookmaker.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesBookmaker && matchesSearch;
    });
  }, [bets, statusFilter, bookmakerFilter, searchTerm]);

  const quickStats = useMemo(() => {
    const closed = filteredBets.filter(b => b.status !== BetStatus.PENDING);
    const profit = closed.reduce((acc, b) => acc + b.profit, 0);
    const stake = closed.reduce((acc, b) => acc + b.stake, 0);
    return {
      profit,
      yield: stake > 0 ? (profit / stake) * 100 : 0,
      count: filteredBets.length
    };
  }, [filteredBets]);

  const getRowHighlightClass = (status: BetStatus) => {
    switch (status) {
      case BetStatus.WON: 
        return 'bg-emerald-500/[0.07] border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)]';
      case BetStatus.LOST: 
        return 'bg-red-500/[0.07] border-red-500/20 shadow-[0_0_40px_rgba(226,0,26,0.05)]';
      case BetStatus.CASH_OUT: 
        return 'bg-yellow-500/[0.07] border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.05)]';
      case BetStatus.REFUNDED: 
        return 'bg-blue-500/[0.07] border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.05)]';
      case BetStatus.PENDING: 
        return 'bg-white/[0.03] border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.02)]';
      default: 
        return 'bg-zinc-900/20 border-white/5';
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-0 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="text-[#e2001a] font-black text-[10px] uppercase tracking-[0.5em]">AUDITORÍA DE CUENTAS</span>
            <h2 className="text-4xl font-black tracking-tight text-white mt-2">Operaciones</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
              {/* Buscador */}
              <div className="relative group">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#e2001a] transition-colors"></i>
                <input 
                    type="text" 
                    placeholder="Buscar descripción o casa..."
                    className="bg-zinc-950 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-white outline-none focus:border-[#e2001a]/50 w-full sm:w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro Casa de Apuestas */}
              <select 
                className="bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-bold text-slate-400 outline-none focus:border-[#e2001a]/50"
                value={bookmakerFilter}
                onChange={(e) => setBookmakerFilter(e.target.value)}
              >
                <option value="all">Todas las Casas</option>
                {availableBookmakers.map(book => (
                    <option key={book} value={book}>{book}</option>
                ))}
              </select>
          </div>
        </div>

        {/* Filtros de Estado */}
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/5 gap-1 overflow-x-auto no-scrollbar">
            {['ALL', 'PENDING', 'WON', 'LOST', 'CASH_OUT'].map(f => (
                <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                    statusFilter === f ? 'bg-[#e2001a] text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
                >
                {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Vivas' : formatStatusText(f as BetStatus)}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-[2rem] backdrop-blur-sm">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Profit Segmento</p>
            <p className={`text-2xl font-black ${quickStats.profit >= 0 ? 'text-emerald-400' : 'text-[#e2001a]'}`}>
              {quickStats.profit >= 0 ? '+' : ''}{quickStats.profit.toFixed(1)}€
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-[2rem] backdrop-blur-sm text-center">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Eficiencia (Yield)</p>
            <p className={`text-2xl font-black ${quickStats.yield >= 0 ? 'text-emerald-400' : 'text-[#e2001a]'}`}>
              {quickStats.yield.toFixed(1)}%
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-[2rem] backdrop-blur-sm text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Muestra</p>
            <p className="text-2xl font-black text-white">{quickStats.count}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filteredBets.length > 0 ? filteredBets.map(bet => (
          <div 
            key={bet.id} 
            className={`glass-panel rounded-[2.5rem] p-6 flex flex-col lg:flex-row items-center gap-6 group hover:border-white/30 transition-all ${getRowHighlightClass(bet.status)}`}
          >
            <div className="flex items-center gap-5 flex-1 w-full">
              <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-950 border border-white/5 flex items-center justify-center text-3xl text-slate-300 shadow-inner">
                  {getSportIcon(bet.sport)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="text-[9px] font-black text-[#ffcc00] uppercase tracking-widest bg-[#ffcc00]/10 border border-[#ffcc00]/20 px-2 py-0.5 rounded-lg">{bet.bookmaker}</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{new Date(bet.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                </div>
                <h4 className="font-black text-lg text-white leading-tight truncate uppercase italic tracking-tight">{bet.description || bet.sport}</h4>
              </div>
            </div>

            <div className="flex gap-12 border-x border-white/5 px-10 hidden lg:flex">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cuota</p>
                <p className="text-xl font-black text-white">{bet.odds.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Apuesta</p>
                <p className="text-xl font-black text-white">{bet.stake}€</p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
               <div className="text-right min-w-[120px]">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Beneficio</p>
                  <p className={`text-3xl font-black tracking-tighter ${bet.status === BetStatus.PENDING ? 'text-zinc-800' : (bet.profit > 0 ? 'text-emerald-400' : bet.profit < 0 ? 'text-[#e2001a]' : 'text-slate-400')}`}>
                    {bet.status === BetStatus.PENDING ? '--' : `${bet.profit > 0 ? '+' : ''}${bet.profit.toFixed(2)}€`}
                  </p>
               </div>

               <div className="flex items-center gap-2">
                 {bet.status === BetStatus.PENDING ? (
                   <>
                     <button onClick={() => onUpdateStatus(bet.id, BetStatus.WON)} className="w-11 h-11 rounded-[1.2rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"><i className="fas fa-check"></i></button>
                     <button onClick={() => onUpdateStatus(bet.id, BetStatus.LOST)} className="w-11 h-11 rounded-[1.2rem] bg-[#e2001a]/10 text-[#e2001a] border border-[#e2001a]/20 hover:bg-[#e2001a] hover:text-white transition-all"><i className="fas fa-times"></i></button>
                   </>
                 ) : (
                    <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${getStatusStyle(bet.status)}`}>{formatStatusText(bet.status)}</div>
                 )}
                 <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(bet)} className="w-8 h-8 rounded-lg hover:bg-white/5 text-zinc-700 hover:text-blue-400 transition-all"><i className="fas fa-pencil text-[10px]"></i></button>
                    <button onClick={() => setBetToDelete(bet.id)} className="w-8 h-8 rounded-lg hover:bg-white/5 text-zinc-700 hover:text-[#e2001a] transition-all"><i className="fas fa-trash text-[10px]"></i></button>
                 </div>
               </div>
            </div>
          </div>
        )) : (
          <div className="glass-panel rounded-[3rem] p-24 text-center border-dashed border-2 border-white/5 flex flex-col items-center gap-6 opacity-40">
            <i className="fas fa-clipboard-question text-6xl text-zinc-800"></i>
            <div>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Sin registros históricos</p>
                <p className="text-zinc-700 font-bold text-[10px] mt-1 italic">Empieza a registrar tus operaciones para ver el análisis</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {betToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <i className="fas fa-triangle-exclamation text-2xl text-[#e2001a]"></i>
            </div>
            
            <h3 className="text-2xl font-black text-white text-center italic tracking-tight mb-2">¿Eliminar Apuesta?</h3>
            <p className="text-slate-500 text-sm font-bold text-center leading-relaxed mb-8">
              Esta acción es permanente y no se podrá recuperar. Los datos de tu bankroll se recalcularán automáticamente.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setBetToDelete(null)}
                className="bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-zinc-800 transition-all uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onDelete(betToDelete);
                  setBetToDelete(null);
                }}
                className="bg-[#e2001a] text-white font-black py-4 rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-red-900/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusStyle = (status: BetStatus) => {
  switch (status) {
    case BetStatus.WON: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case BetStatus.LOST: return 'bg-[#e2001a]/10 text-[#e2001a] border border-[#e2001a]/20';
    case BetStatus.CASH_OUT: return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
    case BetStatus.REFUNDED: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    case BetStatus.CANCELLED: return 'bg-zinc-800 text-zinc-500 border border-white/5';
    default: return 'bg-zinc-800 text-slate-400';
  }
};

export default BetList;
