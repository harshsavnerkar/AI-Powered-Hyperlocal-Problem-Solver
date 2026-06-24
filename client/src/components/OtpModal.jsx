import React, { useState } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';

const OtpModal = ({ isOpen, onClose, onSubmit, email, loading, error, onResend }) => {
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      onSubmit(otp);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-150 dark:border-slate-800 p-6 space-y-6 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <KeyRound size={20} />
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-sans">
              Email Verification
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Info */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            We sent a 6-digit verification code (OTP) to:
          </p>
          <p className="text-xs font-bold text-gray-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-gray-150 dark:border-slate-800 text-center break-all select-all font-mono">
            {email}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">
            *For local testing, check your backend server terminal logs for the generated code!
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="otp-input" className="block text-[10px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest text-center">
              Enter 6-Digit Code
            </label>
            <input
              id="otp-input"
              type="text"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="block w-full py-3.5 text-center text-2xl font-extrabold tracking-[1em] pl-[1em] rounded-xl border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all duration-150"
          >
            {loading ? 'Verifying...' : 'Verify & Continue →'}
          </button>
        </form>
        
        {/* Resend */}
        <div className="text-center text-xs text-gray-500">
          Didn't receive code?{' '}
          <button
            onClick={onResend}
            type="button"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
