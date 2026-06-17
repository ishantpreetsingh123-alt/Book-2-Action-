import React, { useState } from 'react';
import { CreditCard, Lock, Mail, CheckCircle2, ShieldCheck, X, Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 5) {
      setError('Password must contain at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    // Simulating firebase AUTH loading safely
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(email);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 mt-2">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider bg-[#EFF6FF] px-2.5 py-1 rounded-full">
              SaaS Simulated Authenticator
            </span>
            <h3 className="text-xl font-black text-slate-900">
              {mode === 'signup' ? 'Create Your Account' : 'Access Your Profile'}
            </h3>
            <p className="text-xs text-slate-500 font-light max-w-xs mx-auto">
              Save your book analyses, check off habit routines, and manage unlimited premium platforms.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-800 border-2 border-rose-100 px-4 py-2.5 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="alex@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Secure Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck size={14} />
                  <span>{mode === 'signup' ? 'Complete Onboarding' : 'Access Book2Action'}</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            {mode === 'signup' ? (
              <p className="text-xs text-slate-500 font-light">
                Already have a profile?{' '}
                <button 
                  onClick={() => setMode('login')}
                  className="text-brand font-bold hover:underline cursor-pointer"
                >
                  Log In instead
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-light">
                New to the platform?{' '}
                <button 
                  onClick={() => setMode('signup')}
                  className="text-brand font-bold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
  const [stage, setStage] = useState<'details' | 'processing' | 'success'>('details');
  const [stagesText, setStagesText] = useState('Initiating stripe router...');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setStage('processing');

    const steps = [
      { text: "Contacting stripe secure merchant...", delay: 700 },
      { text: "Authorizing premium token logic...", delay: 1500 },
      { text: "Verifying sandbox checkout payment...", delay: 2400 },
      { text: "Upgraded! Syncing premium licenses...", delay: 3000 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setStagesText(step.text);
      }, step.delay);
    });

    setTimeout(() => {
      setStage('success');
    }, 3800);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
    // Reset modal stage
    setTimeout(() => {
      setStage('details');
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative"
      >
        {stage !== 'processing' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        <div className="p-6 sm:p-8 space-y-5">
          {stage === 'details' && (
            <>
              <div className="text-center space-y-1">
                <div className="flex justify-center">
                  <span className="p-2.5 bg-blue-50 text-brand rounded-full mb-1">
                    <Sparkles size={20} className="animate-pulse" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Unlock Premium Tier</h3>
                <p className="text-xs text-slate-500 max-w-xs font-light mx-auto">
                  Subscribe for <strong className="text-slate-800 font-bold">$5/month</strong> to bypass limits and study unlimited books.
                </p>
              </div>

              {/* Billing Item summary */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-150 text-xs text-slate-700 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">Book2Action Pro (Monthly)</span>
                  <p className="text-[10px] text-slate-400">Unlimited analyses, roadmaps, and graphs</p>
                </div>
                <span className="font-extrabold text-slate-900 font-mono">$5.00/mo</span>
              </div>

              {/* Simulated Card form */}
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    className="w-full text-xs bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Card Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <CreditCard size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => {
                        // formats to 4-4-4-4
                        const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        const parts = [];
                        for (let i = 0; i < raw.length; i += 4) {
                          parts.push(raw.substring(i, i + 4));
                        }
                        setCardNumber(parts.length > 0 ? parts.join(' ').substring(0, 19) : '');
                      }}
                      placeholder="4242 4242 4242 4242"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Expiration Date</label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/gi, '');
                        if (raw.length <= 2) {
                          setExpiry(raw);
                        } else {
                          setExpiry(`${raw.substring(0, 2)}/${raw.substring(2, 4)}`);
                        }
                      }}
                      maxLength={5}
                      placeholder="MM/YY"
                      className="w-full text-xs text-center bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-slate-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Security Code (CVC)</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/gi, ''))}
                      placeholder="•••"
                      className="w-full text-xs text-center bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <ShieldCheck size={14} />
                  <span>Authorize Checkout Stripe ($5.00)</span>
                </button>
              </form>
            </>
          )}

          {stage === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative">
                <div className="h-14 w-14 rounded-full border-4 border-blue-100 border-t-brand animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-brand">
                  <CreditCard size={18} />
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">SECURE END-TO-END GATEWAY</h4>
                <p className="text-sm font-bold text-slate-800 transition-all duration-300">
                  {stagesText}
                </p>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="py-6 flex flex-col items-center text-center space-y-5">
              <CheckCircle2 size={56} className="text-[#22C55E] fill-emerald-50" />
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-900">Premium Subscription Active!</h4>
                <p className="text-xs text-slate-500 font-light max-w-xs leading-relaxed mx-auto">
                  We processed your mock payment successfully. Your profile has been upgraded to Premium ($5 Tier). Enjoy limitless wisdom breakdowns.
                </p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 bg-brand hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer border-none"
              >
                Access All Premium Features
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
