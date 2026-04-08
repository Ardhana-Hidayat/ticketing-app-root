import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      console.log("Forgot password API response:", res);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || 'Failed to send reset request. Please check your connection.');
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
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-yellow selection:text-black flex flex-col overflow-x-hidden relative">
        
        {/* Background glow effects */}
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-neon-yellow/10 rounded-full blur-[120px] pointer-events-none"></div>

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
              className="flex items-center gap-3 text-white/50 hover:text-neon-yellow font-bold uppercase tracking-[0.2em] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> 
              <span>RETURN</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-lg">
            
            <div className="bg-dark-grey border border-white/10 p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-yellow/5 blur-3xl pointer-events-none"></div>

              {!isSubmitted ? (
                <>
                  {/* Header */}
                  <div className="mb-10 text-left">
                    <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-tighter text-white leading-none mb-4">
                      RECOVER <span className="text-outline">ACCESS</span>
                    </h1>
                    <div className="w-24 h-1 bg-neon-yellow mb-6" />
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs leading-relaxed">
                      ENTER YOUR REGISTERED EMAIL TO RECEIVE PASSWORD RESET INSTRUCTIONS.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-8 border border-neon-pink p-4 bg-neon-pink/10 flex items-center gap-4">
                      <span className="text-xl text-neon-pink font-heading">ERROR</span>
                      <p className="font-bold text-xs uppercase tracking-widest text-neon-pink flex-1">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="forgot-email" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                        EMAIL ADDRESS
                      </label>
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="user@example.com"
                        className="w-full bg-black border border-white/20 p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-yellow transition-colors font-bold tracking-wide"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full bg-white text-black py-5 font-heading text-2xl uppercase tracking-widest hover:bg-neon-yellow hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          SENDING...
                        </>
                      ) : (
                        'INITIATE RECOVERY'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 bg-neon-cyan/10 rounded-full flex items-center justify-center border border-neon-cyan">
                      <CheckCircle2 className="w-12 h-12 text-neon-cyan" />
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-heading uppercase tracking-tighter text-white mb-6">SIGNAL SENT</h2>
                  <p className="text-white/50 font-bold uppercase tracking-widest text-xs mb-12 leading-relaxed">
                    IF <span className="text-neon-cyan font-black">{email}</span> EXISTS IN OUR DATABASE, A RECOVERY LINK HAS BEEN DISPATCHED.
                  </p>

                  <Link
                    to="/login"
                    className="inline-flex w-full bg-transparent border border-white/20 text-white py-5 font-heading text-xl uppercase tracking-widest hover:border-white transition-all items-center justify-center gap-4"
                  >
                    <ArrowLeft className="w-5 h-5" /> RETURN TO LOGIN
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
