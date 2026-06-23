import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
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
      await signup({ name, email, phone, password, role });
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Left split panel - Illustration & Benefits list */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-50/50 dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Header Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-2 bg-emerald-600 text-white rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white font-sans">
            Community <span className="text-emerald-600">Hero</span>
          </span>
        </div>

        {/* Info list */}
        <div className="my-auto space-y-10 z-10 max-w-md">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-sans leading-tight">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Join thousands of community <span className="text-emerald-600 dark:text-emerald-400 font-bold">heroes</span> making a difference.
            </p>
          </div>

          {/* Core App Benefits */}
          <div className="space-y-6">
            {/* Benefit 1 */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Megaphone size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Report Issues</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Easily report problems in your area with photos and location.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                <LineChart size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Track Progress</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Stay updated on the status and resolution of issues.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                <Trophy size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Earn Rewards</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
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
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
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
  );
};

export default Signup;
