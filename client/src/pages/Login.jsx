import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Simulated Google OAuth login
    setEmail('aarav@civic.com');
    setPassword('password123');
    alert('Simulated Google login: Aarav (Citizen) details have been autofilled!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Left split panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-500 dark:bg-emerald-950 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Abstract background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-900/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-900/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        
        {/* Header Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
            <ShieldAlert size={24} className="text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight font-sans">
            Community <span className="text-emerald-100">Hero</span>
          </span>
        </div>

        {/* Hero Illustration Block */}
        <div className="my-auto space-y-6 z-10 max-w-lg">
          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight font-sans">
            Together, <br />
            We Build Better <br />
            <span className="text-emerald-200">Communities</span>
          </h2>
          <p className="text-emerald-50 dark:text-emerald-100 text-sm leading-relaxed max-w-sm">
            Report issues, track progress, and make your community a better place to live.
          </p>

          {/* Premium city mockup container */}
          <div className="mt-8 relative h-64 w-full rounded-2xl bg-white/10 dark:bg-slate-900/30 backdrop-blur-md border border-white/20 dark:border-white/10 p-6 flex flex-col justify-between shadow-2xl">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            {/* Visual SaaS mock grid inside Left panel */}
            <div className="flex-1 flex flex-col justify-center items-center gap-4">
              <div className="h-10 w-4/5 rounded-lg bg-white/20 animate-pulse flex items-center justify-between px-3 text-xs">
                <span>📍 Sector 15 Pothole</span>
                <span className="bg-red-500/80 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Critical</span>
              </div>
              <div className="h-10 w-4/5 rounded-lg bg-white/20 animate-pulse flex items-center justify-between px-3 text-xs">
                <span>📍 Sector 12 Water Leak</span>
                <span className="bg-yellow-500/80 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Assigned</span>
              </div>
            </div>
            <div className="text-right text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
              CIVIC MONITOR v1.0
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-emerald-100 dark:text-emerald-300 font-medium">
          © {new Date().getFullYear()} Community Hero Platform. All rights reserved.
        </div>
      </div>

      {/* Right split panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-sans tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium">
              Login to continue your journey
            </p>
          </div>

          {/* Form Errors */}
          {(localError || authError) && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <p>{localError || authError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-150 shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all duration-150 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remind & Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-semibold text-gray-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                Remember Me
              </label>
              <a href="#forgot" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all duration-150"
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>

          {/* Social login separator */}
          <div className="relative py-3 flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800" />
            <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-2">
              or continue with
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-bold border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 shadow-sm cursor-pointer transition-all duration-150"
          >
            {/* Google G icon SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.54 15.02 1 12 1 7.35 1 3.4 3.65 1.54 7.54l3.85 2.99C6.27 7.02 8.91 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58l3.77 2.92c2.2-2.03 3.68-5.02 3.68-8.65z" />
              <path fill="#FBBC05" d="M5.39 14.53c-.25-.75-.39-1.55-.39-2.38 0-.83.14-1.63.39-2.38L1.54 6.78C.56 8.74 0 10.92 0 13.25c0 2.33.56 4.51 1.54 6.47l3.85-3.19z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.11.75-2.53 1.19-4.19 1.19-3.09 0-5.73-1.98-6.61-4.96L1.54 16.5c1.86 3.89 5.81 6.5 10.46 6.5z" />
            </svg>
            Continue with Google
          </button>

          {/* Signup prompt */}
          <p className="text-center text-sm font-semibold text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
