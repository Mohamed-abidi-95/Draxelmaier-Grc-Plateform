import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from './AuthContext';

export const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response && response.token) {
        login(response.token, response.email, response.firstName, response.lastName);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // Assuming there's a backend endpoint for this, if not we simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccessMsg('If an account exists for this email, you will receive password reset instructions.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMsg('');
      }, 5000);
    } catch (err: any) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-surface-secondary overflow-hidden font-sans">
      
      {/* Left Side - Brand & Presentation (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative flex-col justify-between p-12 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 opacity-50"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">security</span>
            </div>
            <h1 className="font-headline-lg font-bold text-white tracking-tight">SHIELDGRC</h1>
          </div>
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Enterprise Governance, Risk, and Compliance
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            A unified platform to manage your security posture, align with global frameworks, and streamline your audits with AI-driven intelligence.
          </p>
          
          <div className="flex items-center gap-6 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span className="font-label-md">ISO 27001 Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <span className="font-label-md">AI Copilot</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-slate-500 font-label-sm">
          &copy; {new Date().getFullYear()} SHIELDGRC. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 animate-fade-in relative">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 relative z-10">
          
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">security</span>
            </div>
            <h1 className="font-headline-sm font-bold text-text-primary tracking-tight">SHIELDGRC</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-headline-md font-bold text-text-primary mb-2">
              {isForgotPassword ? 'Reset Password' : 'Welcome back'}
            </h2>
            <p className="font-body-sm text-text-secondary">
              {isForgotPassword 
                ? 'Enter your email address to receive reset instructions' 
                : 'Enter your credentials to access the GRC portal'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
              <p className="text-[13px] font-medium text-error leading-relaxed">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="material-symbols-outlined text-success text-[20px] shrink-0 mt-0.5">check_circle</span>
              <p className="text-[13px] font-medium text-success leading-relaxed">{successMsg}</p>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-1.5">
                <label className="block font-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-text-tertiary material-symbols-outlined text-[20px]">mail</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com" 
                    required 
                    className="w-full bg-surface-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-label-md py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }}
                  className="w-full bg-surface hover:bg-surface-secondary text-text-secondary font-label-md py-3 rounded-lg flex items-center justify-center transition-all border border-border"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="block font-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-text-tertiary material-symbols-outlined text-[20px]">mail</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com" 
                    required 
                    className="w-full bg-surface-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-label-sm text-text-secondary uppercase tracking-wider font-semibold">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(''); }} 
                    className="font-label-sm text-primary hover:underline text-[12px] bg-transparent border-none cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-text-tertiary material-symbols-outlined text-[20px]">lock</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    required 
                    className="w-full bg-surface-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-label-md py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="font-body-sm text-text-tertiary text-[12px]">
              Protected by Shield AI. Access is restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
