
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api.ts';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) {
      setError("Please provide a valid 10-digit number.");
      return;
    }
    if (pin.length !== 4) {
      setError("Resonance PIN must be 4 digits.");
      return;
    }

    setIsProcessing(true);

    try {
      if (mode === 'register') {
        if (name.trim().length < 2) {
          setError("Please enter a valid name.");
          setIsProcessing(false);
          return;
        }
        
        const allUsers = await api.getAllUsers();
        if (allUsers.find(u => u.phone === phone)) {
          setError("This frequency is already registered. Please login.");
          setMode('login');
        } else {
          const newUser: User = {
            name: name.trim(),
            phone: phone,
            bookings: [],
            role: phone.endsWith('2576') ? 'admin' : 'user'
          };
          await api.saveUser(newUser, pin);
          onSuccess(newUser);
        }
      } else {
        const user = await api.authenticate(phone, pin);
        if (user) {
          onSuccess(user);
        } else {
          setError("Invalid coordinates or PIN mismatch.");
        }
      }
    } catch (err) {
      setError("Frequency transmission error. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-10 text-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 z-10">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative z-10">
            <span className="text-brand-red text-[9px] font-black uppercase tracking-[0.4em] mb-2 block">Identity Sanctuary</span>
            <div className="flex gap-4 items-end">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-slate-200">
                {mode === 'login' ? 'Entry' : 'Manifest'}
              </h2>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => setMode('login')}
                  className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setMode('register')}
                  className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
                >
                  Join
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3">
              {mode === 'login' ? 'Synchronize your existing profile' : 'Create your unique aura signature'}
            </p>
          </div>

          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-red/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2">
              <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="Explorer Name"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-brand-red transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">WhatsApp Number</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+91</span>
              <input 
                required
                type="tel" 
                placeholder="10-digit phone"
                maxLength={10}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-16 pr-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-brand-red transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Resonance PIN (4 Digits)</label>
            <input 
              required
              type="password" 
              maxLength={4}
              placeholder="••••"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-center text-xl font-black tracking-[1em] text-slate-900 outline-none focus:border-brand-red transition-all"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              disabled={isProcessing}
            />
          </div>

          {error && (
            <div className="p-3 bg-brand-red/10 border border-brand-red/20 rounded-xl">
              <p className="text-brand-red text-[9px] font-black uppercase text-center tracking-wider">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full py-5 bg-slate-900 text-slate-200 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {mode === 'login' ? 'Sync Profile' : 'Activate Aura'}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-slate-300 text-[8px] font-black uppercase tracking-[0.2em]">
            MAKEMYDAYS SECURE ACCESS NODE
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
