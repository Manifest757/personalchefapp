/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSupabase } from '../lib/SupabaseContext';
import { ChefHat, Mail, Lock, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginWithEmail, signUpWithEmail, loginAsDemo } = useSupabase();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error, data } = await signUpWithEmail(email, password);
        if (error) {
          if (error.message.includes('rate limit')) {
            throw new Error('Too many signup attempts. Please wait a few minutes before trying again, or try logging in if you already have an account.');
          }
          throw error;
        }
        
        if (data?.user && data?.session) {
          // If confirmation is disabled in Supabase, they are logged in immediately
          // The context will pick up the session change via onAuthStateChange
        } else {
          setError('Signup Successful! Please check your email inbox to confirm your account (or log in if confirmation is disabled).');
          setIsSignUp(false);
        }
      } else {
        const { error } = await loginWithEmail(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Your atelier access is pending email confirmation. Please check your inbox.');
          }
          if (error.message.includes('rate limit')) {
            throw new Error('Too many login attempts. Please wait a few minutes.');
          }
          throw error;
        }
      }
    } catch (err: any) {
      if (err.message.includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes before trying again or try logging in if you already signed up.');
      } else {
        setError(err.message || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-brand-sage/10 flex items-center justify-center shadow-lg border border-brand-ink/5 relative group">
            <div className="absolute inset-0 bg-brand-copper/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ChefHat size={40} className="text-brand-ink relative z-10" />
            <div className="absolute -bottom-2 -right-2 bg-brand-copper text-brand-bg p-1.5 rounded-xl shadow-md">
              <ShieldCheck size={14} />
            </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-serif italic text-brand-ink font-bold tracking-tight">Chef's Atelier</h1>
            <p className="text-brand-ink/40 text-sm font-medium tracking-wide uppercase">Private Culinary Studio</p>
          </div>
        </div>

        <div className="glass p-8 rounded-[2rem] border border-brand-ink/10 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-widest ml-1">Email Studio Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/20" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chef@atelier.com"
                  required
                  className="w-full bg-brand-ink/[0.02] border-2 border-brand-ink/10 focus:border-brand-copper/50 rounded-2xl py-3.5 pl-12 pr-4 text-brand-ink outline-none transition-all placeholder:text-brand-ink/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-widest ml-1">Secure Passkey</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/20" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-brand-ink/[0.02] border-2 border-brand-ink/10 focus:border-brand-copper/50 rounded-2xl py-3.5 pl-12 pr-4 text-brand-ink outline-none transition-all placeholder:text-brand-ink/10"
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center bg-red-50 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-ink text-brand-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-brand-ink/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-brand-bg/30 border-t-brand-bg animate-spin rounded-full"></div>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                  <span>{isSignUp ? 'Establish Atelier Access' : 'Enter Studio'}</span>
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-brand-ink/10"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold text-brand-ink/20 uppercase tracking-widest">Or authenticate via</span>
            <div className="flex-grow border-t border-brand-ink/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => login()}
              className="flex-1 bg-white border border-brand-ink/10 text-brand-ink py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-ink/5 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Google</span>
            </button>
            <button 
              onClick={handleDemo}
              disabled={loading}
              className="flex-1 bg-brand-sage/10 border border-brand-sage/20 text-brand-ink py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-sage/20 transition-colors shadow-sm"
            >
              <LogIn size={18} className="text-brand-ink/40" />
              <span>Demo Mode</span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest hover:text-brand-copper transition-colors"
            >
              {isSignUp ? 'Already have an Atelier account? Login' : 'Need new studio credentials? Sign Up'}
            </button>
          </div>
        </div>

        <p className="text-[9px] text-brand-ink/30 text-center leading-relaxed max-w-[240px] mx-auto uppercase tracking-widest font-medium">
          Access restricted to registered culinary professionals. By entering, you agree to Atelier studio protocols.
        </p>
      </div>
    </div>
  );
};
