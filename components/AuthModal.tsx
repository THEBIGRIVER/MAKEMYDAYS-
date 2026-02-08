import React, { useState } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';
import { api } from '../services/api';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
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

            <div className="bg-slate-100 p-3 rounded-xl border">
              <code className="text-xs font-bold">{currentDomain}</code>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full">
          <h2 className="text-xl font-black mb-4">Verify your email</h2>
          <p className="text-sm text-slate-600 mb-6">
            We sent a verification email to <b>{email}</b>.
          </p>
          <button
            onClick={() => {
              setShowVerificationScreen(false);
              setMode('login');
            }}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full">
        <h2 className="text-2xl font-black mb-6">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </h2>

        <button
          onClick={handleGoogleLogin}
          disabled={isProcessing}
          className="w-full py-3 mb-6 border rounded-xl font-bold"
        >
          Continue with Google
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-3 rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isProcessing}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isProcessing}
          />

          {error && (
            <div className="text-sm text-red-600 font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <button onClick={() => setMode('register')} className="underline">
              Create an account
            </button>
          ) : (
            <button onClick={() => setMode('login')} className="underline">
              Already have an account?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
