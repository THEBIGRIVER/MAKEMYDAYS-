
import React, { useState } from 'react';
import { User } from '../types.ts';
import { auth } from '../services/firebase.ts';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut
} from 'firebase/auth';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError("Please enter your name.");
          setIsProcessing(false);
          return;
        }
        
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: name });
          
          // Send verification email
          await sendEmailVerification(userCredential.user);
          
          // Sign out immediately so they aren't logged in unverified
          await signOut(auth);
          
          setShowVerificationScreen(true);
        } catch (err: any) {
          if (err.code === 'auth/email-already-in-use') {
            setError("User already exists. Please sign in.");
          } else {
            setError(err.message || "Manifestation failed. Try again.");
          }
        }
      } else {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          // Check if email is verified
          if (!userCredential.user.emailVerified) {
            await signOut(auth);
            setError("Please verify your email before logging in. Check your inbox.");
            setIsProcessing(false);
            return;
          }

          const loggedUser: User = {
            uid: userCredential.user.uid,
            name: userCredential.user.displayName || 'Explorer',
            email: email,
            bookings: [], 
            role: email === 'admin@makemydays.com' ? 'admin' : 'user'
          };
          onSuccess(loggedUser);
        } catch (err: any) {
          setError("Email or password is incorrect.");
        }
      }
    } catch (err: any) {
      setError("Frequency transmission error. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showVerificationScreen) {
    return (
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
        <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-slate-900 p-10 text-slate-200 text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-music-pulse">
              <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-200 mb-2">Check Your Inbox</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
              We have sent you a verification email to <span className="text-brand-red">{email}</span>. Please verify it and log in.
            </p>
          </div>
          <div className="p-10">
            <button 
              onClick={() => {
                setShowVerificationScreen(false);
                setMode('login');
              }}
              className="w-full py-5 bg-slate-900 text-slate-200 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-brand-red transition-all flex items-center justify-center gap-3"
            >
              Back to Login
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-red/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5">
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
            <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Email Address</label>
            <input 
              required
              type="email" 
              placeholder="explorer@sanctuary.com"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-brand-red transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Security Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-brand-red transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
      </div>
    </div>
  );
};

export default AuthModal;
