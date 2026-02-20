
import React, { useMemo } from 'react';
import { Bet, BankrollStats, BetStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface StatisticsProps {
  bets: Bet[];
  stats: BankrollStats;
}

const COLORS = ['#10b981', '#e2001a', '#3b82f6', '#ffcc00', '#a855f7'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {label && <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1">{label}</p>}
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.payload.fill || '#e2001a' }}></div>
            <p className="text-xs font-black text-white uppercase tracking-tight">
              {item.name}: <span className={item.value >= 0 ? 'text-emerald-400' : 'text-[#e2001a]'}>
                {typeof item.value === 'number' ? (item.name.toLowerCase().includes('profit') ? `${item.value.toFixed(2)}€` : item.value) : item.value}
              </span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Statistics: React.FC<StatisticsProps> = ({ bets, stats }) => {
  const sportDistribution = useMemo(() => {
    const dist = bets.reduce((acc: any[], bet) => {
      const existing = acc.find(a => a.name === bet.sport);
      if (existing) {
        existing.value += 1;
        existing.profit += bet.profit;
      } else {
        acc.push({ name: bet.sport, value: 1, profit: bet.profit });
      }
      return acc;
    }, []);
    return dist.sort((a, b) => b.profit - a.profit);
  }, [bets]);

  const monthlyProfit = useMemo(() => {
    const data: { [key: string]: number } = {};
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    bets.filter(b => b.status !== BetStatus.PENDING).forEach(bet => {
      const date = new Date(bet.date);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      data[key] = (data[key] || 0) + bet.profit;
    });

    return Object.entries(data).map(([name, profit]) => ({ name, profit }));
  }, [bets]);

  const statusDistribution = [
    { name: 'Ganada', value: bets.filter(b => b.status === BetStatus.WON).length },
    { name: 'Perdida', value: bets.filter(b => b.status === BetStatus.LOST).length },
    { name: 'Otras', value: bets.filter(b => b.status !== BetStatus.WON && b.status !== BetStatus.LOST && b.status !== BetStatus.PENDING).length },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-8 px-4 md:px-0 pb-20">
      <header>
        <span className="text-[#e2001a] font-bold text-xs uppercase tracking-[0.3em]">ANALYTICS</span>
        <h2 className="text-4xl font-black tracking-tight text-white mt-2">Estadísticas</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center border-white/5">
          <h3 className="text-lg font-black mb-6 w-full text-white uppercase italic">Éxito por Estados</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value" stroke="none">
                  {statusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
          <h3 className="text-lg font-black mb-6 text-white uppercase italic">Profit por Deporte</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sportDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} fontWeight="800" />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} fontWeight="800" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="profit" radius={[10, 10, 0, 0]}>
                  {sportDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#e2001a'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-2 glass-panel p-8 rounded-[2.5rem] border-white/5">
          <h3 className="text-lg font-black mb-6 text-white uppercase italic">Evolución Mensual</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProfit}>
                <CartesianGrid strokeDasharray="8 8" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} fontWeight="800" />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} fontWeight="800" />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}} 
                  content={<CustomTooltip />}
                />
                <Bar dataKey="profit" radius={[15, 15, 0, 0]}>
                  {monthlyProfit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#e2001a'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
