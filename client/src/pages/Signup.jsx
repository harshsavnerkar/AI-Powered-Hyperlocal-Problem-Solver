import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import appLogo from '../assets/logo.jpg';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Megaphone,
  LineChart,
  Trophy
} from 'lucide-react';
import signupIllustration from '../assets/signup_illustration.png';
import OtpModal from '../components/OtpModal.jsx';

const Signup = () => {
  const { signup, error: authError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('citizen'); // default citizen
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Empty', color: 'bg-gray-300' });
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  // Evaluate password strength in real time
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: 'Empty', color: 'bg-gray-300' });
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let text = 'Weak';
    let color = 'bg-red-500';

    if (score === 2) {
      text = 'Medium';
      color = 'bg-amber-500';
    } else if (score >= 3) {
      text = 'Strong';
      color = 'bg-emerald-500';
    }

    setPasswordStrength({ score, text, color });
  }, [password]);

  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setOtpError('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (!agreeTerms) {
      setLocalError('You must agree to the terms and privacy policy');
      return;
    }

    setLoading(true);
    try {
      // Trigger OTP Request first
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setShowOtpModal(true);
    } catch (err) {
      setLocalError(err.message || 'Verification email dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await signup({
        name,
        email,
        phone,
        password,
        role,
        otp,
        isGoogle: false
      });
      setShowOtpModal(false);
      navigate('/dashboard');
    } catch (err) {
      setOtpError(err.message || 'Signup failed. Invalid verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError('');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      alert('📢 A new verification code has been sent to your email!');
    } catch (err) {
      setOtpError('Failed to resend verification code');
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
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-150 dark:border-slate-800 flex flex-col lg:flex-row min-h-[650px] lg:min-h-[720px]">
        {/* Left Panel - Illustration */}
        <div className="hidden lg:flex lg:w-5/12 bg-emerald-50/50 dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800 flex-col justify-between p-10 relative overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-3.5 z-10">
            <img src={appLogo} alt="CommunityHero Logo" className="h-10 w-auto rounded-xl border border-emerald-500/25 shadow-sm shrink-0" />
            <span className="font-black text-2xl tracking-tight text-gray-955 dark:text-white font-sans leading-none">
              Community<span className="text-emerald-500">Hero</span>
            </span>
          </div>

          {/* Title block */}
          <div className="my-auto space-y-8 z-10 w-full flex-1 flex flex-col justify-center mt-12">
            <h2 className="text-3.5xl xl:text-4xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white font-sans">
              Join the <br />
              Movement of <br />
              <span className="text-emerald-600 dark:text-emerald-400">Change-makers</span>
            </h2>
            
            {/* Highlights */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                  <Megaphone size={14} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-gray-800 dark:text-slate-200">Voice Problems</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">Report local issues directly to volunteers and admins.</span>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                  <Trophy size={14} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-gray-800 dark:text-slate-200">Earn Badges & Rewards</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">Unlock levels and point badges as an active citizen helper.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-100 dark:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                  <LineChart size={14} />
                </div>
                <div>
                  <span className="block font-bold text-xs text-gray-800 dark:text-slate-200">Monitor Impact</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">View resolved issue history and civic statistics live.</span>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative w-full rounded-2xl overflow-hidden mt-6">
              <img 
                src={signupIllustration} 
                alt="Community Hero Signup Illustration" 
                className="w-full object-contain max-h-[220px]" 
              />
            </div>
          </div>

          {/* Footer copyright */}
          <div className="z-10 text-xs text-gray-400 dark:text-slate-500 font-medium pt-4">
            © {new Date().getFullYear()} Community Hero Platform. All rights reserved.
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-sans tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">
                Verify email address and customize your civic profile
              </p>
            </div>

            {/* Form Errors */}
            {(localError || authError) && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>⚠️</span>
                <p>{localError || authError}</p>
              </div>
            )}

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <User size={16} />
                  </span>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="phone" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Phone size={16} />
                  </span>
                  <input
                    id="phone"
                    type="text"
                    required
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-650 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-650 dark:hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="md:col-span-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">
                  <span>Password Strength</span>
                  <span className={
                    passwordStrength.text === 'Strong' ? 'text-emerald-500' :
                    passwordStrength.text === 'Medium' ? 'text-amber-500' : 'text-red-500'
                  }>{passwordStrength.text}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
                </div>
              </div>

              {/* Role Selection cards */}
              <div className="md:col-span-2 space-y-2 mt-2">
                <span className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  Select Your Role
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Citizen */}
                  <div 
                    onClick={() => setRole('citizen')}
                    className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 relative ${
                      role === 'citizen' 
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/10' 
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Citizen</span>
                      <input 
                        type="radio" 
                        name="role" 
                        checked={role === 'citizen'} 
                        onChange={() => setRole('citizen')}
                        className="text-emerald-650 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Report and track community issues</p>
                  </div>

                  {/* Volunteer */}
                  <div 
                    onClick={() => setRole('volunteer')}
                    className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 relative ${
                      role === 'volunteer' 
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/10' 
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-600 dark:text-blue-400">Volunteer</span>
                      <input 
                        type="radio" 
                        name="role" 
                        checked={role === 'volunteer'} 
                        onChange={() => setRole('volunteer')}
                        className="text-blue-650 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Solve nearby issues and help citizens</p>
                  </div>

                  {/* Admin */}
                  <div 
                    onClick={() => setRole('admin')}
                    className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 relative ${
                      role === 'admin' 
                        ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/10' 
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-purple-600 dark:text-purple-400">Admin</span>
                      <input 
                        type="radio" 
                        name="role" 
                        checked={role === 'admin'} 
                        onChange={() => setRole('admin')}
                        className="text-purple-650 focus:ring-purple-500 h-3.5 w-3.5"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Manage users and oversee community resolutions</p>
                  </div>
                </div>
              </div>

              {/* Terms and conditions */}
              <div className="md:col-span-2 flex items-start gap-2.5 mt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[10px] text-gray-500 leading-normal select-none cursor-pointer">
                  I agree to the <a href="#terms" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Terms of Service</a> and{' '}
                  <a href="#privacy" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Privacy Policy</a>.
                </label>
              </div>

              {/* Register Button */}
              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all duration-150"
                >
                  {loading ? 'Registering...' : 'Sign Up →'}
                </button>
              </div>
            </form>

            {/* Login prompt */}
            <p className="text-center text-xs font-semibold text-gray-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                Login
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

export default Signup;
