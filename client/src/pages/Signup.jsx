import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import appLogo from '../assets/logo.jpg';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle,
  Megaphone,
  LineChart,
  Trophy
} from 'lucide-react';
import signupIllustration from '../assets/signup_illustration.png';
import OtpModal from '../components/OtpModal.jsx';

const Signup = () => {
  const { signup, googleLogin, googleData, clearGoogleData, error: authError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('citizen'); // default citizen
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isGoogleRegistered, setIsGoogleRegistered] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  const handleGoogleCallback = async (credential) => {
    setLoading(true);
    setLocalError('');
    try {
      const result = await googleLogin(credential);
      if (result.exists) {
        alert('📢 You already have an account! Logging you in...');
        navigate('/dashboard');
      } else {
        alert('📢 Google authentication successful!\n\nPlease enter your Phone Number, create a Password, and select your Role to finish creating your account.');
      }
    } catch (err) {
      setLocalError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClickFallback = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.info('📢 Google OAuth Client ID is not configured in client/.env. Running in Simulation Mode to demonstrate the signup auto-fill flow.');
    }
    handleGoogleCallback('simulated_google_token');
  };

  useEffect(() => {
    /* global google */
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (typeof google !== 'undefined' && clientId) {
        setGoogleScriptLoaded(true);
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (res) => handleGoogleCallback(res.credential)
          });
          google.accounts.id.renderButton(
            document.getElementById('google-signup-button'),
            { theme: 'outline', size: 'large', width: '380' }
          );
        } catch (e) {
          console.warn('Failed to render native Google button:', e);
        }
      }
    };

    // Check periodically for google script load
    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (googleData) {
      setName(googleData.name || '');
      setEmail(googleData.email || '');
      setIsGoogleRegistered(true);
    } else {
      setIsGoogleRegistered(false);
    }
  }, [googleData]);

  useEffect(() => {
    return () => {
      clearGoogleData();
    };
  }, []);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Weak', color: 'bg-red-500' });
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

    if (!name || !email || !phone || !password || !confirmPassword || !role) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setLocalError('You must agree to the Terms of Service & Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      if (isGoogleRegistered) {
        // Bypass OTP for verified Google emails
        await signup({ name, email, phone, password, role, isGoogle: true });
        navigate('/dashboard');
      } else {
        // Send OTP for manual signup
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        setShowOtpModal(true);
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setOtpLoading(true);
    setOtpError('');
    try {
      await signup({ name, email, phone, password, role, isGoogle: false, otp });
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-200">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-150 dark:border-slate-800 flex flex-col lg:flex-row min-h-[600px] lg:min-h-[680px]">
        {/* Left split panel - Illustration & Benefits list */}
        <div className="hidden lg:flex lg:w-1/2 bg-emerald-50/50 dark:bg-slate-900 border-r border-gray-150 dark:border-slate-800 flex-col justify-between p-10 relative overflow-hidden">
        {/* Header Logo */}
        <div className="flex items-center gap-3.5 z-10">
          <img src={appLogo} alt="CommunityHero Logo" className="h-10 w-auto rounded-xl border border-emerald-500/25 shadow-sm shrink-0" />
          <span className="font-black text-2xl tracking-tight text-gray-955 dark:text-white font-sans leading-none">
            Community<span className="text-emerald-500">Hero</span>
          </span>
        </div>

        {/* Info list */}
        <div className="my-auto space-y-6 z-10 max-w-md">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-sans leading-tight">
              Create Account
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Join thousands of community <span className="text-emerald-600 dark:text-emerald-400 font-bold">heroes</span> making a difference.
            </p>
          </div>

          {/* Real Illustration Image in the middle */}
          <div className="relative w-full rounded-2xl overflow-hidden">
            <img 
              src={signupIllustration} 
              alt="Community Hero Signup Illustration" 
              className="w-full object-contain max-h-[260px]" 
            />
          </div>

          {/* Core App Benefits below image */}
          <div className="space-y-4">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Megaphone size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Report Issues</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                  Easily report problems in your area with photos and location.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <LineChart size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Track Progress</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                  Stay updated on the status and resolution of issues.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Trophy size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Earn Rewards</h4>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                  Earn points and badges for your contributions to the community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-gray-400 dark:text-slate-500 font-medium">
          © {new Date().getFullYear()} Community Hero Platform. All rights reserved.
        </div>
      </div>

        {/* Right split panel - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-xl space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-sans tracking-tight">
              Create Your Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">
              Fill in your details to get started
            </p>
          </div>

          {/* Form Errors */}
          {(localError || authError) && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={16} />
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
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  disabled={isGoogleRegistered}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm transition-all ${isGoogleRegistered ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 cursor-not-allowed opacity-80' : ''}`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isGoogleRegistered}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs shadow-sm transition-all ${isGoogleRegistered ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 cursor-not-allowed opacity-80' : ''}`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
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
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
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
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
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
                      className="text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
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
                      className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Verify reported issues & build trust</p>
                </div>

                {/* Admin */}
                <div 
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all duration-150 relative ${
                    role === 'admin' 
                      ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/10' 
                      : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-violet-600 dark:text-violet-400">Authority</span>
                    <input 
                      type="radio" 
                      name="role" 
                      checked={role === 'admin'} 
                      onChange={() => setRole('admin')}
                      className="text-violet-600 focus:ring-violet-500 h-3.5 w-3.5"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Manage tasks and coordinate resolutions</p>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="md:col-span-2">
              <label className="flex items-start gap-2.5 text-xs font-semibold text-gray-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>
                  I agree to the{' '}
                  <a href="#terms" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all"
            >
              {loading ? 'Registering...' : 'Sign Up →'}
            </button>
          </form>

          {/* Social signup separator */}
          <div className="relative py-2 flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800" />
            <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-2">
              or continue with
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-slate-800" />
          </div>

          {/* Google Button Container */}
          <div className="w-full flex flex-col items-center justify-center min-h-[46px] mt-0.5">
            {googleScriptLoaded ? (
              <div id="google-signup-button" className="w-full flex justify-center"></div>
            ) : (
              <button
                onClick={handleGoogleClickFallback}
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
            )}
          </div>

          {/* Login prompt */}
          <p className="text-center text-sm font-semibold text-gray-500">
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
    </div>
  );
};

export default Signup;
