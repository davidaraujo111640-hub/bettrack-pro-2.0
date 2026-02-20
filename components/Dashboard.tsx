
import React, { useMemo } from 'react';
import { BankrollStats, Bet, BetStatus } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface DashboardProps {
  stats: BankrollStats;
  bets: Bet[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-zinc-950 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">{label}</p>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${val >= 0 ? 'bg-emerald-400' : 'bg-[#e2001a]'}`}></div>
          <p className="text-sm font-black text-white tracking-tighter">
            PROFIT: <span className={val >= 0 ? 'text-emerald-400' : 'text-[#e2001a]'}>
              {val >= 0 ? '+' : ''}{val.toFixed(2)}€
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ stats, bets }) => {
  // Explicitly type chartData to ensure cumulativeProfit is treated as a number
  const chartData = useMemo(() => {
    const closedBets = bets
      .filter(b => b.status !== BetStatus.PENDING)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const data: { date: string; cumulativeProfit: number }[] = [{ date: 'Start', cumulativeProfit: 0 }];
    let currentSum = 0;
    closedBets.forEach(bet => {
      currentSum += bet.profit;
      data.push({
        date: new Date(bet.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        cumulativeProfit: Number(currentSum.toFixed(2))
      });
    });
    return data;
  }, [bets]);

  const lastFiveBets = useMemo(() => {
    return bets
      .filter(b => b.status !== BetStatus.PENDING)
      .slice(0, 5);
  }, [bets]);

  // Fix: Added explicit return type and properly typed accumulator to fix the 'unknown' error on toFixed
  const topPerformance = useMemo<{ name: string; profit: number } | null>(() => {
    const sports: Record<string, number> = {};
    
    bets.forEach(b => {
      if (b.status !== BetStatus.PENDING) {
        sports[b.sport] = (sports[b.sport] || 0) + b.profit;
      }
    });
    
    const entries = Object.entries(sports);
    if (entries.length === 0) return null;
    
    const bestSport = entries.sort((a, b) => b[1] - a[1])[0];
    return { name: bestSport[0], profit: bestSport[1] };
  }, [bets]);

  const pendingBets = useMemo(() => {
    return bets.filter(b => b.status === BetStatus.PENDING).slice(0, 3);
  }, [bets]);

  const off = useMemo(() => {
    const dataMax = Math.max(...chartData.map((i) => i.cumulativeProfit), 0);
    const dataMin = Math.min(...chartData.map((i) => i.cumulativeProfit), 0);
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  }, [chartData]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header con Estado de Forma */}
      <header className="px-4 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <span className="text-[#e2001a] font-black text-[10px] uppercase tracking-[0.4em]">CENTRAL DE OPERACIONES</span>
            <h2 className="text-4xl font-black tracking-tighter text-white mt-1">Hola, Tipster <span className="text-[#ffcc00]">Pro</span></h2>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Estado de Forma (Últ. 5)</span>
            <div className="flex gap-1.5">
                {lastFiveBets.length > 0 ? lastFiveBets.map((bet, i) => {
                    let colorClass = 'bg-zinc-800 border-zinc-700 text-zinc-500';
                    let label = 'V';

                    if (bet.status === BetStatus.WON) {
                        colorClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
                        label = 'G';
                    } else if (bet.status === BetStatus.LOST) {
                        colorClass = 'bg-red-500/10 border-red-500/30 text-red-500';
                        label = 'P';
                    } else if (bet.status === BetStatus.REFUNDED) {
                        colorClass = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
                        label = 'R';
                    } else if (bet.status === BetStatus.CASH_OUT) {
                        colorClass = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
                        label = 'C';
                    } else if (bet.profit > 0) {
                        colorClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
                        label = 'G';
                    } else if (bet.profit < 0) {
                        colorClass = 'bg-red-500/10 border-red-500/30 text-red-500';
                        label = 'P';
                    }

                    return (
                        <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${colorClass}`}>
                            {label}
                        </div>
                    );
                }) : <span className="text-zinc-700 text-[10px] font-bold italic">Sin datos recientes</span>}
            </div>
        </div>
      </header>

      {/* Grid Principal: KPIs Maestros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 px-4 md:px-0">
        
        {/* Card Principal: Profit & ROI */}
        <div className="lg:col-span-8 glass-panel rounded-[2.5rem] p-10 relative overflow-hidden border-white/5">
           <div className={`absolute -right-10 -top-10 w-64 h-64 blur-[80px] rounded-full opacity-20 ${stats.totalProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
           
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <span className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Rendimiento Total</span>
                <div className="flex items-baseline gap-3 mt-1">
                    <h3 className={`text-6xl font-black tracking-tighter ${stats.totalProfit >= 0 ? 'text-white' : 'text-[#e2001a]'}`}>
                        {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(1)}<span className="text-2xl">€</span>
                    </h3>
                </div>
                <div className="flex gap-4 mt-6">
                    <div className="flex flex-col">
                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-tighter">Yield</span>
                        <span className={`text-lg font-black ${stats.yield >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.yield.toFixed(1)}%</span>
                    </div>
                    <div className="w-px h-10 bg-white/5"></div>
                    <div className="flex flex-col">
                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-tighter">Win Rate</span>
                        <span className="text-lg font-black text-white">{stats.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-px h-10 bg-white/5"></div>
                    <div className="flex flex-col">
                        <span className="text-zinc-600 text-[9px] font-black uppercase tracking-tighter">Stake Medio</span>
                        <span className="text-lg font-black text-white">{(bets.reduce((acc, b) => acc + b.stake, 0) / (bets.length || 1)).toFixed(1)}€</span>
                    </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                        <span className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Especialidad</span>
                        <h4 className="text-white font-black text-xl mt-1">{topPerformance ? topPerformance.name : 'Pendiente'}</h4>
                    </div>
                    <div className="bg-[#ffcc00] text-black w-10 h-10 rounded-xl flex items-center justify-center text-lg">
                    {getSportIcon(topPerformance?.name || 'Otros')}
                </div>
             </div>
             <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-400">Has generado <span className="text-emerald-400 font-black">+{topPerformance?.profit?.toFixed(1) ?? '0.0'}€</span> solo en este deporte. ¡Sigue así!</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Card Bankroll: Progreso */}
        <div className="lg:col-span-4 glass-panel rounded-[2.5rem] p-8 border-white/5 flex flex-col justify-between">
           <div>
                <span className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Banca Disponible</span>
                <p className="text-4xl font-black text-white mt-1">{stats.currentBankroll.toFixed(1)}€</p>
           </div>
           
           <div className="relative py-6 flex flex-col items-center">
                {/* Visual simple de progreso */}
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mt-4">
                    <div 
                        className="h-full bg-gradient-to-r from-[#e2001a] to-[#ffcc00] shadow-[0_0_15px_rgba(226,0,26,0.5)] transition-all duration-1000"
                        style={{ width: `${Math.min(100, (stats.currentBankroll / (stats.initialBankroll * 2)) * 100)}%` }}
                    ></div>
                </div>
                <div className="flex justify-between w-full mt-2">
                    <span className="text-[8px] font-black text-zinc-600 uppercase">Inicio: {stats.initialBankroll}€</span>
                    <span className="text-[8px] font-black text-zinc-400 uppercase">Objetivo 2x: {stats.initialBankroll * 2}€</span>
                </div>
           </div>

           <div className="bg-zinc-950 p-4 rounded-2xl flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${stats.totalProfit >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                    <i className={stats.totalProfit >= 0 ? 'fas fa-arrow-trend-up' : 'fas fa-arrow-trend-down'}></i>
                </div>
                <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase">Crecimiento</p>
                    <p className={`text-lg font-black ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {((stats.totalProfit / stats.initialBankroll) * 100).toFixed(1)}%
                    </p>
                </div>
           </div>
        </div>
      </div>

      {/* Sección Inferior: Gráfico y Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 px-4 md:px-0">
        {/* Curva de Rendimiento */}
        <div className="lg:col-span-8 glass-panel rounded-[2.5rem] p-8 border-white/5">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Curva de Profit</h3>
                <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-white/5 text-[10px] font-black text-zinc-500">ÚLTIMOS MOVIMIENTOS</div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={off} stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset={off} stopColor="#e2001a" stopOpacity={0.5} />
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="date" stroke="#525252" fontSize={9} tickLine={false} axisLine={false} fontWeight="900" />
                    <YAxis stroke="#525252" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}€`} fontWeight="900" />
                    <Tooltip 
                        cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                        content={<CustomTooltip />}
                    />
                    <ReferenceLine y={0} stroke="#ffffff10" />
                    <Area 
                        type="monotone" 
                        dataKey="cumulativeProfit" 
                        strokeWidth={3} 
                        stroke="#10b981" 
                        fill="url(#splitColor)" 
                        animationDuration={2000} 
                        activeDot={{ r: 6, fill: '#10b981', stroke: '#000', strokeWidth: 4 }}
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Sidebar de Apuestas Pendientes */}
        <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="glass-panel rounded-[2.5rem] p-6 border-white/5 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">En Juego</h3>
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[9px] font-black uppercase">{stats.activeBets} Activas</span>
                </div>
                
                <div className="space-y-3">
                    {pendingBets.length > 0 ? pendingBets.map(bet => (
                        <div key={bet.id} className="bg-zinc-950/50 border border-white/5 p-4 rounded-2xl flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#e2001a] text-lg">
                                {getSportIcon(bet.sport)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-white font-bold text-xs truncate">{bet.description}</p>
                                <p className="text-[9px] font-black text-zinc-600 uppercase">{bet.odds.toFixed(2)} • {bet.stake}€</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 opacity-20">
                            <i className="fas fa-ghost text-3xl mb-3"></i>
                            <p className="text-[10px] font-black uppercase">Sin apuestas pendientes</p>
                        </div>
                    )}
                </div>
                
                {stats.activeBets > 3 && (
                    <button className="w-full mt-4 text-[9px] font-black text-[#e2001a] uppercase tracking-widest hover:text-white transition-all">Ver todas las activas</button>
                )}
            </div>

            <div className="bg-gradient-to-br from-[#e2001a] to-[#920011] rounded-[2.5rem] p-6 text-white shadow-xl shadow-red-900/20">
                <div className="flex items-center gap-3 mb-2">
                    <i className="fas fa-shield-halved"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">Tipster Security</span>
                </div>
                <h4 className="font-black text-lg italic">Gestión de Riesgo</h4>
                <p className="text-xs font-bold text-white/70 mt-1 leading-relaxed">
                    Tu stake medio es del {((bets.reduce((acc, b) => acc + b.stake, 0) / (bets.length || 1) / stats.currentBankroll) * 100).toFixed(1)}% de tu banca actual. ¡Mantén la disciplina!
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export const getSportIcon = (sport: string): React.ReactNode => {
  const containerClass = "flex items-center justify-center w-full h-full transition-transform duration-300 group-hover:scale-110";
  
  switch (sport) {
    case 'Fútbol': return <div className={containerClass}><i className="fas fa-futbol"></i></div>;
    case 'Baloncesto': return <div className={containerClass}><i className="fas fa-basketball"></i></div>;
    case 'Tenis': return (
      <div className={`${containerClass} relative`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[1.1em] h-[1.1em]">
          <circle cx="9" cy="9" r="7" />
          <path d="M14 14l7 7" />
          <path d="M12 12l3 3" />
          <path d="M9 2v14M2 9h14" />
          <path d="M5.5 5.5l7 7M5.5 12.5l7-7" />
        </svg>
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ffcc00] rounded-full border border-black/40 shadow-sm"></div>
      </div>
    );
    case 'eSports': return <div className={containerClass}><i className="fas fa-gamepad"></i></div>;
    case 'MMA': return <div className={containerClass}><i className="fas fa-hand-fist"></i></div>;
    case 'NFL': return <div className={containerClass}><i className="fas fa-football"></i></div>;
    case 'Béisbol': return <div className={containerClass}><i className="fas fa-baseball"></i></div>;
    case 'Ciclismo': return <div className={containerClass}><i className="fas fa-bicycle"></i></div>;
    case 'F1': return <div className={containerClass}><i className="fas fa-flag-checkered"></i></div>;
    case 'MotoGP': return <div className={containerClass}><i className="fas fa-motorcycle"></i></div>;
    case 'Boxeo': return <div className={containerClass}><i className="fas fa-hand-fist"></i></div>;
    case 'Caballos': return <div className={containerClass}><i className="fas fa-horse"></i></div>;
    default: return <div className={containerClass}><i className="fas fa-trophy"></i></div>;
  }
};

export default Dashboard;
