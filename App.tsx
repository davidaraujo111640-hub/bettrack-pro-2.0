
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BetList from './components/BetList';
import Statistics from './components/Statistics';
import AddBetModal from './components/AddBetModal';
import AIInsights from './components/AIInsights';
import BankrollManager from './components/BankrollManager';
import Auth from './components/Auth';
import Toast from './components/Toast';
import { Bet, BetStatus, BankrollStats, Bankroll, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bt_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [bankrolls, setBankrolls] = useState<Bankroll[]>(() => {
    const saved = localStorage.getItem('bt_bankrolls');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Bankroll Principal', initialCapital: 1000, color: '#e2001a' }];
  });

  const [activeBankrollId, setActiveBankrollId] = useState<string>('all');
  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bet_track_bets');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bt_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('bt_session');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bt_bankrolls', JSON.stringify(bankrolls));
    setLastSaved(new Date().toLocaleTimeString());
  }, [bankrolls]);

  useEffect(() => {
    localStorage.setItem('bet_track_bets', JSON.stringify(bets));
    setLastSaved(new Date().toLocaleTimeString());
  }, [bets]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const filteredBets = useMemo(() => {
    if (activeBankrollId === 'all') return bets;
    return bets.filter(b => b.bankrollId === activeBankrollId);
  }, [bets, activeBankrollId]);

  const stats = useMemo<BankrollStats>(() => {
    const closedBets = filteredBets.filter(b => b.status !== BetStatus.PENDING);
    const totalProfit = closedBets.reduce((acc, b) => acc + b.profit, 0);
    const totalStake = closedBets.reduce((acc, b) => acc + b.stake, 0);
    const wonBets = closedBets.filter(b => b.status === BetStatus.WON || (b.status === BetStatus.CASH_OUT && b.profit > 0)).length;
    
    const initialCap = activeBankrollId === 'all' 
      ? bankrolls.reduce((acc, b) => acc + b.initialCapital, 0)
      : (bankrolls.find(b => b.id === activeBankrollId)?.initialCapital || 0);

    return {
      totalProfit,
      roi: totalStake > 0 ? (totalProfit / totalStake) * 100 : 0,
      yield: totalStake > 0 ? (totalProfit / totalStake) * 100 : 0,
      winRate: closedBets.length > 0 ? (wonBets / closedBets.length) * 100 : 0,
      totalBets: filteredBets.length,
      activeBets: filteredBets.filter(b => b.status === BetStatus.PENDING).length,
      initialBankroll: initialCap,
      currentBankroll: initialCap + totalProfit
    };
  }, [filteredBets, activeBankrollId, bankrolls]);

  const handleAddBet = (newBet: Omit<Bet, 'id' | 'profit'> & { manualProfit?: number }) => {
    let profit = 0;
    if (newBet.status === BetStatus.WON) profit = (newBet.odds * newBet.stake) - newBet.stake;
    else if (newBet.status === BetStatus.LOST) profit = -newBet.stake;
    else if (newBet.status === BetStatus.CASH_OUT) profit = newBet.manualProfit || 0;
    else if (newBet.status === BetStatus.REFUNDED || newBet.status === BetStatus.CANCELLED) profit = 0;

    if (editingBet) {
      setBets(bets.map(b => b.id === editingBet.id ? { ...newBet, id: editingBet.id, profit } : b));
      showToast('Operación actualizada');
      setEditingBet(null);
    } else {
      const betWithId: Bet = {
        ...newBet,
        id: Math.random().toString(36).substr(2, 9),
        profit
      };
      setBets([betWithId, ...bets]);
      showToast('Nueva apuesta registrada');
    }
    setIsAddModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: BetStatus, manualProfit?: number) => {
    setBets(bets.map(bet => {
      if (bet.id === id) {
        let profit = 0;
        if (newStatus === BetStatus.WON) profit = (bet.odds * bet.stake) - bet.stake;
        else if (newStatus === BetStatus.LOST) profit = -bet.stake;
        else if (newStatus === BetStatus.CASH_OUT) profit = manualProfit || 0;
        else if (newStatus === BetStatus.CANCELLED || newStatus === BetStatus.REFUNDED) profit = 0;
        return { ...bet, status: newStatus, profit };
      }
      return bet;
    }));

    let statusLabel = '';
    switch(newStatus) {
      case BetStatus.WON: statusLabel = 'Ganada'; break;
      case BetStatus.LOST: statusLabel = 'Perdida'; break;
      case BetStatus.CASH_OUT: statusLabel = 'Cash Out'; break;
      case BetStatus.REFUNDED: statusLabel = 'Reembolsada'; break;
      case BetStatus.CANCELLED: statusLabel = 'Anulada'; break;
      default: statusLabel = newStatus;
    }
    showToast(`Estado cambiado a ${statusLabel}`, 'info');
  };

  const handleEdit = (bet: Bet) => {
    setEditingBet(bet);
    setIsAddModalOpen(true);
  };

  const handleDeleteBet = (id: string) => {
    setBets(bets.filter(b => b.id !== id));
    showToast('Operación eliminada', 'error');
  };

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar la sesión de seguridad?')) {
      setUser(null);
      showToast('Sesión cerrada correctamente', 'info');
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    showToast(`Bienvenido, ${u.name}`);
  };

  const handleSetActiveBankroll = (id: string) => {
    setActiveBankrollId(id);
    const bankName = id === 'all' ? 'Global' : bankrolls.find(b => b.id === id)?.name;
    showToast(`Cambiado a ${bankName}`, 'info');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex flex-col md:flex-row h-screen bg-transparent p-0 md:p-6 gap-0 md:gap-6 text-slate-100 overflow-hidden">
        {/* Sidebar escritorio */}
        <nav className="hidden md:flex w-72 glass-panel rounded-[2rem] p-8 flex-col gap-8 shadow-2xl border-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-[#e2001a] p-3 rounded-2xl">
              <i className="fas fa-chart-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none text-white">BETTRACK</h1>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#ffcc00] uppercase">PRO EDITION</span>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-[#e2001a] border border-white/5">
                    <i className="fas fa-user-shield"></i>
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate">{user.name}</p>
                    <span className="text-[8px] font-black text-[#ffcc00] uppercase tracking-widest">{user.plan} MEMBER</span>
                </div>
             </div>
             <button onClick={handleLogout} className="w-full mt-3 py-2 text-[9px] font-black text-zinc-500 hover:text-[#e2001a] uppercase tracking-widest transition-all">
                Cerrar Sesión <i className="fas fa-sign-out-alt ml-1"></i>
             </button>
          </div>

          <div className="flex flex-col gap-2">
            <NavLink to="/" icon="fas fa-house" label="Resumen" />
            <NavLink to="/bets" icon="fas fa-list-check" label="Mis Apuestas" />
            <NavLink to="/statistics" icon="fas fa-chart-pie" label="Estadísticas" />
            <NavLink to="/bankrolls" icon="fas fa-wallet" label="Bankrolls" />
            <NavLink to="/ai-insights" icon="fas fa-bolt" label="Analista AI" />
          </div>

          <div className="mt-auto space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <select 
                value={activeBankrollId}
                onChange={(e) => setActiveBankrollId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none"
              >
                <option value="all">📂 Global</option>
                {bankrolls.map(b => (
                  <option key={b.id} value={b.id}>💰 {b.name}</option>
                ))}
              </select>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter flex items-center gap-1">
                    <i className="fas fa-check-circle"></i> Autoguardado
                 </span>
                 <span className="text-[9px] font-bold text-slate-600 italic">{lastSaved}</span>
              </div>
            </div>
            <button 
              onClick={() => { setEditingBet(null); setIsAddModalOpen(true); }}
              className="w-full bg-[#e2001a] text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-red-900/40 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <i className="fas fa-plus-circle"></i>
              Nueva Apuesta
            </button>
          </div>
        </nav>

        {/* Navegación móvil */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-4 py-3 flex items-center justify-around rounded-t-[2rem]">
            <MobileNavLink to="/" icon="fas fa-house" />
            <MobileNavLink to="/bets" icon="fas fa-list-check" />
            <button 
                onClick={() => { setEditingBet(null); setIsAddModalOpen(true); }}
                className="bg-[#e2001a] w-14 h-14 rounded-full flex items-center justify-center -mt-10 shadow-xl shadow-red-900/40 border-4 border-[#050505] active:scale-90 transition-transform"
            >
                <i className="fas fa-plus text-white text-xl"></i>
            </button>
            <MobileNavLink to="/statistics" icon="fas fa-chart-pie" />
            <MobileNavLink to="/bankrolls" icon="fas fa-wallet" />
        </nav>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 px-4 pt-6 md:p-0">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard stats={stats} bets={filteredBets} />} />
              <Route path="/bets" element={<BetList bets={filteredBets} onDelete={handleDeleteBet} onUpdateStatus={handleUpdateStatus} onEdit={handleEdit} />} />
              <Route path="/statistics" element={<Statistics bets={filteredBets} stats={stats} />} />
              <Route path="/ai-insights" element={<AIInsights bets={filteredBets} />} />
              <Route path="/bankrolls" element={<BankrollManager bankrolls={bankrolls} onUpdate={setBankrolls} activeBankrollId={activeBankrollId} onSelect={handleSetActiveBankroll} />} />
            </Routes>
          </div>
        </main>

        {isAddModalOpen && (
          <AddBetModal 
            bankrolls={bankrolls}
            activeBankrollId={activeBankrollId}
            onClose={() => { setIsAddModalOpen(false); setEditingBet(null); }} 
            onSubmit={handleAddBet}
            initialData={editingBet || undefined}
          />
        )}

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold group ${isActive ? 'bg-[#e2001a]/10 text-[#e2001a] border border-[#e2001a]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
      <i className={`${icon} w-6 text-center text-lg ${isActive ? 'text-[#e2001a]' : ''}`}></i>
      <span className="tracking-tight text-sm">{label}</span>
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string, icon: string }> = ({ to, icon }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${isActive ? 'text-[#e2001a] bg-[#e2001a]/10' : 'text-slate-500'}`}>
            <i className={`${icon} text-xl`}></i>
        </Link>
    );
};

export default App;
