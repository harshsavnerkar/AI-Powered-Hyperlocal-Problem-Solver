import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import loginIllustration from '../assets/login_illustration.png';
import appLogo from '../assets/logo.jpg';
import OtpModal from '../components/OtpModal.jsx';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, verifyLoginOtp, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, rememberMe);
      if (res && res.otpRequired) {
        setShowOtpModal(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await verifyLoginOtp(email, otp);
      setShowOtpModal(false);
      navigate('/dashboard');
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      alert('📢 A new verification code has been sent to your email!');
    } catch (err) {
      setOtpError('Failed to resend OTP');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-200"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-150 dark:border-slate-800 flex flex-col lg:flex-row min-h-[600px] lg:min-h-[680px]">
        {/* Left split panel - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-emerald-50/50 dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800 flex-col justify-between p-10 relative overflow-hidden">
          {/* Header Logo */}
          <div className="flex items-center gap-3.5 z-10">
            <img src={appLogo} alt="CommunityHero Logo" className="h-10 w-auto rounded-xl border border-emerald-500/25 shadow-sm shrink-0" />
            <span className="font-black text-2xl tracking-tight text-gray-955 dark:text-white font-sans leading-none">
              Community<span className="text-emerald-500">Hero</span>
            </span>
          </div>

          {/* Hero Illustration Block */}
          <div className="my-auto space-y-6 z-10 w-full flex-1 flex flex-col justify-between mt-8">
            <div>
              <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white font-sans">
                Together, <br />
                We Build Better <br />
                <span className="text-emerald-600 dark:text-emerald-400">Communities</span>
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mt-3">
                Report issues, track progress, and make your community a better place to live.
              </p>
            </div>

            {/* Real Illustration Image */}
            <div className="relative w-full rounded-2xl overflow-hidden mt-6">
              <img 
                src={loginIllustration} 
                alt="Community Hero Login Illustration" 
                className="w-full object-contain max-h-[280px]" 
              />
            </div>
          </div>

          {/* Footer info */}
          <div className="z-10 text-xs text-gray-400 dark:text-slate-500 font-medium">
            © {new Date().getFullYear()} Community Hero Platform. All rights reserved.
          </div>
        </div>

        {/* Right split panel - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-10">
          <div className="w-full max-w-md space-y-6">
            {/* Logo on mobile/tablet */}
            <div className="flex items-center gap-3.5 justify-center lg:hidden">
              <img src={appLogo} alt="CommunityHero Logo" className="h-10 w-auto rounded-xl border border-emerald-500/25 shadow-sm shrink-0" />
              <span className="font-black text-2xl tracking-tight text-gray-900 dark:text-white font-sans leading-none font-extrabold">
                Community<span className="text-emerald-500">Hero</span>
              </span>
            </div>

            {/* Compact Illustration on mobile/tablet */}
            <div className="relative w-full rounded-2xl overflow-hidden block lg:hidden border border-emerald-500/10 bg-emerald-500/5 p-3 flex justify-center">
              <img 
                src={loginIllustration} 
                alt="Community Hero Login Illustration" 
                className="max-h-[160px] object-contain" 
              />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-sans tracking-tight text-center lg:text-left">
                Welcome Back!
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium text-center lg:text-left">
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-650 dark:hover:text-white transition-colors duration-150"
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

            {/* Signup prompt */}
            <p className="text-center text-xs font-semibold text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* OTP Verification Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleOtpSubmit}
        email={email}
        loading={otpLoading}
        error={otpError}
        onResend={handleResendOtp}
      />
    </motion.div>
  );
};

export default Login;
