
import React, { useState } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';
import { api } from '../services/api';
// Fixed: Changed from 'firebase/auth' to '@firebase/auth' to resolve export resolution issues in TypeScript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from '@firebase/auth';

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
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const loggedUser: User = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Explorer',
        email: firebaseUser.email || '',
        bookings: [],
        role: firebaseUser.email === 'admin@makemydays.com' ? 'admin' : 'user',
      };

      await api.syncUserProfile(loggedUser);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;

        setError(
          <div className="space-y-3 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
              Action Required
            </p>

            <div className="bg-slate-800 p-3 rounded-xl border border-white/10">
              <code className="text-xs font-bold text-slate-200">{currentDomain}</code>
            </div>
          </div>
        );
      } else {
        setError('Google sign-in failed. Please try again.');
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
          setError('Please enter your name.');
          setIsProcessing(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setShowVerificationScreen(true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setError('Please verify your email before logging in.');
          setIsProcessing(false);
          return;
        }

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showVerificationScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-10 text-center max-w-md w-full">
          <h2 className="text-xl font-black mb-4 text-white">Verify your email</h2>
          <p className="text-sm text-slate-400 mb-6">
            We sent a verification email to <b className="text-white">{email}</b>.
          </p>
          <button
            onClick={() => {
              setShowVerificationScreen(false);
              setMode('login');
            }}
            className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-black italic uppercase text-white">
             {mode === 'login' ? 'Portal Login' : 'New Frequency'}
           </h2>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
           </button>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isProcessing}
          className="w-full py-3.5 mb-8 border border-white/10 bg-white/5 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.32-2.04 4.44-1.2 1.2-3.08 2.48-5.8 2.48-4.68 0-8.52-3.8-8.52-8.52s3.84-8.52 8.52-8.52c2.52 0 4.36.96 5.68 2.24l2.36-2.36C18.4 1.8 15.6 0 12 0 5.4 0 0 5.4 0 12s5.4 12 12 12c3.6 0 6.48-1.2 8.64-3.48 2.24-2.24 3.16-5.44 3.16-8.16 0-.8-.08-1.52-.2-2.24h-11.12z"/>
          </svg>
          Google Sync
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-white transition-all text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-white transition-all text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isProcessing}
          />

          <input
            type="password"
            placeholder="Secure Password"
            className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-white transition-all text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isProcessing}
          />

          {error && (
            <div className="text-[10px] text-red-500 font-black uppercase tracking-widest">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
          >
            {mode === 'login' ? 'Reconnect' : 'Launch Profile'}
          </button>
        </form>

        <div className="mt-8 text-center">
          {mode === 'login' ? (
            <button onClick={() => setMode('register')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">
              Create a new account
            </button>
          ) : (
            <button onClick={() => setMode('login')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">
              Already have a frequency?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
