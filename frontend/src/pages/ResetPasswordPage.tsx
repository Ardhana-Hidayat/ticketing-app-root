import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '@/services/api';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing or invalid.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        token,
        new_password: password,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please ensure your token is still valid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
       <style>{`
        .text-outline {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-pink selection:text-white flex flex-col overflow-x-hidden relative">
        
        {/* Background glow effects */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Navbar */}
        <nav className="w-full bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
              <span className="text-3xl md:text-5xl font-heading uppercase tracking-tighter text-white">
                KLIX<span className="text-outline">TICKET</span>
              </span>
            </Link>
            <Link 
              to="/login" 
              className="flex items-center gap-3 text-white/50 hover:text-neon-pink font-bold uppercase tracking-[0.2em] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> 
              <span>CANCEL</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-lg">
            
            <div className="bg-dark-grey border border-white/10 p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-3xl pointer-events-none"></div>

              {!isSuccess ? (
                <>
                  {/* Header */}
                  <div className="mb-10 text-left">
                    <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-tighter text-white leading-none mb-4">
                      RESET <span className="text-outline">KEY</span>
                    </h1>
                    <div className="w-24 h-1 bg-neon-pink mb-6" />
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs leading-relaxed">
                      ENTER A NEW PASSWORD BELOW TO SECURE YOUR ACCOUNT.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-8 border border-neon-pink p-4 bg-neon-pink/10 flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 flex-shrink-0 text-neon-pink" />
                      <span className="font-bold text-xs uppercase tracking-widest text-neon-pink flex-1">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                        NEW PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full bg-black border border-white/20 p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-pink transition-colors font-bold tracking-wide"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                        CONFIRM NEW PASSWORD
                      </label>
                      <input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-black border border-white/20 p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-pink transition-colors font-bold tracking-wide"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="w-full bg-white text-black py-5 font-heading text-2xl uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 transform hover:-rotate-1"
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        'SAVE NEW KEY'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 bg-neon-cyan/10 rounded-full flex items-center justify-center border border-neon-cyan">
                      <CheckCircle2 className="w-12 h-12 text-neon-cyan" />
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading uppercase tracking-tighter text-white mb-6">KEY UPDATED!</h2>
                  <p className="text-white/50 font-bold uppercase tracking-widest text-xs leading-relaxed">
                    YOUR SECURITY KEY HAS BEEN SUCCESSFULLY ROLLED. REROUTING YOU TO LOGIN...
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ResetPasswordPage;
