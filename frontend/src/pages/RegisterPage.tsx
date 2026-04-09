import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      if (res.token) {
        authApi.saveSession(res.token, res.user);
        navigate('/');
      } else {
        setError('Registration successful! Please login.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      if (err.name === 'RequestError' && err.errors) {
        const allErrors = Object.values(err.errors).join(', ');
        setError(`Error: ${allErrors}`);
      } else {
        setError(err.message || 'Registration failed, try again.');
      }
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
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-cyan selection:text-black flex flex-col overflow-x-hidden relative">
        
        {/* Background glow effects */}
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-neon-yellow/10 rounded-full blur-[100px] pointer-events-none"></div>

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
              className="hidden md:block bg-white text-black px-8 py-3 font-heading text-xl tracking-wider hover:bg-neon-pink hover:text-white transition-all transform hover:scale-105 uppercase"
            >
              LOGIN
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
          <div className="w-full max-w-lg">
            
            <div className="bg-dark-grey border border-white/10 p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl pointer-events-none"></div>

              {/* Header */}
              <div className="mb-10">
                <h1 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white mb-4">
                  REGISTER
                </h1>
                <div className="w-24 h-1 bg-neon-cyan mb-6" />
                <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">
                  SECURE YOUR ACCESS TO THE FESTIVAL
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-8 border border-neon-cyan p-4 bg-neon-cyan/10 flex items-center gap-4">
                  <span className="text-xl text-neon-cyan font-heading">INFO</span>
                  <p className="font-bold text-xs uppercase tracking-widest text-neon-cyan flex-1">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="register-name" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    FULL NAME
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full bg-black border border-white/20 p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-pink transition-colors font-bold tracking-wide"
                  />
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full bg-black border border-white/20 p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan transition-colors font-bold tracking-wide"
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Min. 8 characters"
                      className="w-full bg-black border border-white/20 p-4 pr-16 text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan transition-colors font-bold tracking-wide"
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
                  <label htmlFor="register-confirm-password" className="block text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
                    CONFIRM PASSWORD
                  </label>
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full bg-black border border-white/20 p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-cyan transition-colors font-bold tracking-wide"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-5 font-heading text-2xl uppercase tracking-widest hover:bg-neon-pink transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      REGISTERING...
                    </>
                  ) : (
                    'CREATE ACCOUNT'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
                  ALREADY HAVE AN ACCOUNT?
                </p>
                <Link 
                  to="/login" 
                  className="inline-block border border-white/20 text-white px-8 py-3 font-heading uppercase text-lg tracking-widest hover:border-white transition-all"
                >
                  ACCESS TERMINAL
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default RegisterPage;
