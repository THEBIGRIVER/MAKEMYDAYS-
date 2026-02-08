
import React, { useState } from 'react';
import { User } from '../types.ts';
import { auth } from '../services/firebase.ts';
import { api } from '../services/api.ts';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface AuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | React.ReactNode>('');

  const handleGoogleLogin = async () => {
    setError('');
    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    
    provider.setCustomParameters({ 
      prompt: 'select_account',
      client_id: '751688831675-hpjh8e4fd37d9fh81ri5edmvml5pqsjo.apps.googleusercontent.com'
    });

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      const loggedUser: User = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Explorer',
        email: firebaseUser.email || '',
        bookings: [], 
        role: firebaseUser.email === 'admin@makemydays.com' ? 'admin' : 'user'
      };

      await api.syncUserProfile(loggedUser);
      onSuccess();
    } catch (err: any) {
      console.error("Google Auth Error Detail:", err);
      
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        setError(
          <div className="text-left space-y-3">
            <p className="font-black text-brand-red uppercase text-[10px] tracking-widest">Action Required: Domain Unauthorized</p>
            <p className="text-[11px] leading-relaxed text-slate-600 font-bold italic">
              Firebase security blocks logins from unknown domains. You must authorize this domain to proceed.
            </p>
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <code className="text-[10px] font-black text-slate-900">{currentDomain}</code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentDomain);
                  alert('Domain copied to clipboard!');
                }}
                className="text-[8px] font-black uppercase text-brand-red hover:underline"
              >
                Copy
              </button>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
              Add it in: <span className="text-slate-900">Firebase Console &gt; Auth &gt; Settings &gt; Authorized Domains</span>
            </p>
          </div>
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        // Handled silently
      } else {
        setError("Celestial alignment failed. Please check your connection or try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
          await sendEmailVerification(userCredential.user);
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
          if (!userCredential.user.emailVerified) {
            await signOut(auth);
            setError("Please verify your email before logging in. Check your inbox.");
            setIsProcessing(false);
            return;
          }
          onSuccess();
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
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
            <span className="text-brand-moss text-[9px] font-black uppercase tracking-[0.4em] mb-2 block">Identity Sanctuary</span>
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
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-moss/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="p-10 pb-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isProcessing}
            className="w-full py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 group hover:bg-white hover:border-brand-moss transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-slate-900/10 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-600 group-hover:text-slate-900 transition-colors">
              {isProcessing ? 'Connecting...' : 'Continue with Google'}
            </span>
          </button>
          
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative px-4 bg-white text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 italic">or calibrate via</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="Explorer Name"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-brand-moss transition-all"
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
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-brand-moss transition-all"
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
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 outline-none focus:border-brand-moss transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {error && (
            <div className={`p-6 rounded-2xl border transition-all duration-500 ${typeof error === 'string' ? 'bg-brand-moss/10 border-brand-moss/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className={typeof error === 'string' ? 'text-brand-moss text-[10px] font-black uppercase text-center tracking-wider leading-relaxed' : ''}>
                {error}
              </div>
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
