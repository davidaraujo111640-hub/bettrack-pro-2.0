
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegistering && !name)) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    if (isRegistering) {
      const users = JSON.parse(localStorage.getItem('bt_users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        setError('Este email ya está registrado.');
        return;
      }
      const newUser = { id: Math.random().toString(36).substr(2, 9), email, name, plan: 'PRO' };
      localStorage.setItem('bt_users', JSON.stringify([...users, { ...newUser, password }]));
      onLogin(newUser as User);
    } else {
      const users = JSON.parse(localStorage.getItem('bt_users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        const { password, ...userWithoutPass } = user;
        onLogin(userWithoutPass as User);
      } else {
        setError('Credenciales incorrectas.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#e2001a]/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ffcc00]/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e2001a] rounded-[2rem] shadow-2xl shadow-red-900/40 mb-6 rotate-12">
            <i className="fas fa-chart-line text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic">BETTRACK <span className="text-[#ffcc00]">PRO</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Audit Intelligence System</p>
        </div>

        <div className="glass-panel rounded-[3rem] p-8 md:p-10 border-white/5 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-8 uppercase italic tracking-tight">
            {isRegistering ? 'Crear Nueva Cuenta' : 'Acceso Restringido'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-5">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-[#e2001a] transition-all" 
                  placeholder="Tu nombre" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Corporativo</label>
              <input 
                type="email"
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-[#e2001a] transition-all" 
                placeholder="email@ejemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
              <input 
                type="password"
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-[#e2001a] transition-all" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-[#e2001a] text-[10px] font-black uppercase text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                <i className="fas fa-exclamation-triangle mr-2"></i>{error}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full py-5 bg-gradient-to-r from-[#e2001a] to-[#920011] rounded-2xl text-xs font-black text-white shadow-2xl shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] mt-4"
            >
              {isRegistering ? 'Registrarme Ahora' : 'Entrar en el Sistema'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-all"
            >
              {isRegistering ? '¿Ya tienes cuenta? Acceder' : '¿Eres nuevo? Crear Cuenta'}
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-[9px] font-bold mt-8 uppercase tracking-[0.2em]">
          &copy; 2025 BetTrack Pro • Secure Encryption Active
        </p>
      </div>
    </div>
  );
};

export default Auth;
