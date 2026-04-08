import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Loader2, Save, ArrowLeft, Mail, ShieldCheck, Ticket, ShoppingBag, Star, Edit3, X, AlertCircle } from 'lucide-react';
import { authApi, orderApi } from '@/services/api';
import type { User, Order } from '@/services/api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const editFormRef = React.useRef<HTMLDivElement>(null);
  const passwordFormRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editFormRef.current) {
      editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isChangingPassword && passwordFormRef.current) {
      passwordFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isEditing, isChangingPassword]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, ordersData] = await Promise.all([
          authApi.getMe(),
          orderApi.getMyOrders()
        ]);
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setOrders(ordersData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile data');
        if (err.status === 401 || err.status === '401') {
          authApi.logout();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const updatedUser = await authApi.updateProfile(name, email);
      setUser(updatedUser);
      const token = localStorage.getItem('auth_token') || '';
      authApi.saveSession(token, updatedUser);
      setSuccess('PROFILE SUCCESSFULLY UPDATED.');
      setIsEditing(false);
    } catch (err: any) {
      if (err.name === 'RequestError' && err.errors) {
        const allErrors = Object.values(err.errors).join(', ');
        setError(`Error: ${allErrors}`);
      } else {
        setError(err.message || 'Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match');
      return;
    }

    setIsSaving(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setSuccess('SECURITY KEY UPDATED!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setError('');
    setSuccess('');
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-neon-cyan mb-6" />
        <p className="font-heading text-xl uppercase tracking-widest text-neon-cyan animate-pulse">DECRYPTING DATA...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .text-outline {
          -webkit-text-stroke: 1px white;
          color: transparent;
        }
      `}</style>
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-pink selection:text-white flex flex-col overflow-x-hidden relative">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
              <span className="text-3xl md:text-5xl font-heading uppercase tracking-tighter text-white">
                KLIX<span className="text-outline">TICKET</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/" 
                className="hidden sm:flex text-white/50 hover:text-white font-bold uppercase tracking-[0.2em] transition-colors items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> HOME
              </Link>
              <button 
                onClick={handleLogout}
                className="border border-neon-pink text-neon-pink px-6 py-3 font-heading uppercase text-lg tracking-widest hover:bg-neon-pink hover:text-white transition-all flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 px-4 py-12 md:py-20 flex items-center justify-center relative z-10 w-full max-w-[1200px] mx-auto">
          <div className="w-full bg-dark-grey border border-white/10 backdrop-blur-xl">
            
            {/* Header / ID Card */}
            <div className="p-8 md:p-12 relative overflow-hidden border-b border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-black border border-white/20 flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-16 h-16 text-white/20" />
                    )}
                  </div>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="absolute -bottom-3 -right-3 bg-white text-black p-4 hover:bg-neon-cyan transition-all border border-black"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <span className="bg-neon-cyan/10 text-neon-cyan px-3 py-1 font-bold text-xs uppercase tracking-[0.3em] border border-neon-cyan/20">
                      {user?.role}
                    </span>
                    <span className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">
                      SUBJECT ID: #{user?.id}
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-heading uppercase tracking-tighter text-white leading-none mb-4">
                    {user?.name}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-white/50">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-16">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 border border-white/5 bg-black/50 overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                <div className="p-8 flex items-center gap-6 group hover:bg-white/5 transition-colors">
                  <div className="bg-neon-cyan/10 p-4 border border-neon-cyan/20 group-hover:border-neon-cyan transition-colors">
                    <Ticket className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-1">TICKETS OWNED</p>
                    <p className="text-3xl font-heading tracking-widest text-white">
                      {orders.reduce((acc, o) => acc + (o.order_items?.length || 0), 0)}
                    </p>
                  </div>
                </div>
                
                <div className="p-8 flex items-center gap-6 group hover:bg-white/5 transition-colors">
                  <div className="bg-neon-pink/10 p-4 border border-neon-pink/20 group-hover:border-neon-pink transition-colors">
                    <ShoppingBag className="w-8 h-8 text-neon-pink" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-1">TOTAL ORDERS</p>
                    <p className="text-3xl font-heading tracking-widest text-white">{orders.length}</p>
                  </div>
                </div>
                
                <div className="p-8 flex items-center gap-6 group hover:bg-white/5 transition-colors">
                  <div className="bg-neon-yellow/10 p-4 border border-neon-yellow/20 group-hover:border-neon-yellow transition-colors">
                    <Star className="w-8 h-8 text-neon-yellow" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase mb-1">RESONANCE POINTS</p>
                    <p className="text-3xl font-heading tracking-widest text-white">
                      {Math.floor(orders.reduce((acc, o) => acc + (o.total_amount || 0), 0) / 10000)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {(error || success) && (
                <div className={`p-6 border flex items-center gap-4 ${error ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' : 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'}`}>
                  {error ? <AlertCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  <span className="font-bold uppercase text-xs tracking-widest flex-1">{error || success}</span>
                </div>
              )}

              {/* Form Area */}
              <div ref={editFormRef} className="space-y-16">
                
                {/* Profile Information */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-heading uppercase tracking-tighter text-white flex items-center gap-4">
                      <span className="w-8 h-1 bg-neon-cyan"></span>
                      {isEditing ? 'EDIT DATA FILE' : 'PERSONAL LOG'}
                    </h2>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                          FULL NAME
                        </label>
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className={`w-full bg-black border border-white/20 p-5 text-white font-bold tracking-wide focus:outline-none focus:border-neon-cyan transition-colors disabled:opacity-50 disabled:border-white/5`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                          EMAIL ADDRESS
                        </label>
                        <input
                          type="email"
                          disabled={!isEditing}
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className={`w-full bg-black border border-white/20 p-5 text-white font-bold tracking-wide focus:outline-none focus:border-neon-cyan transition-colors disabled:opacity-50 disabled:border-white/5`}
                          required
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex flex-col sm:flex-row gap-6 pt-4">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 bg-white text-black py-5 font-heading text-2xl uppercase tracking-widest hover:bg-neon-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'OVERWRITE FILE'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-10 py-5 bg-transparent border border-white/20 font-heading text-xl text-white uppercase tracking-widest hover:border-white transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" /> CANCEL
                        </button>
                      </div>
                    )}
                  </form>
                </section>

                {/* Password Section */}
                <section ref={passwordFormRef} className="pt-16 border-t border-white/10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-heading uppercase tracking-tighter text-white flex items-center gap-4">
                      <span className="w-8 h-1 bg-neon-pink"></span>
                      SECURITY CLEARANCE
                    </h2>
                  </div>

                  {isChangingPassword ? (
                    <form onSubmit={handleChangePassword} className="space-y-8 bg-black/40 border border-neon-pink/30 p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                            CURRENT SECURITY KEY
                          </label>
                          <input
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className="w-full bg-black border border-white/20 p-5 text-white font-bold tracking-wide focus:outline-none focus:border-neon-pink transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                            NEW KEY
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-black border border-white/20 p-5 text-white font-bold tracking-wide focus:outline-none focus:border-neon-pink transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                            RE-ENTER NEW KEY
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-black border border-white/20 p-5 text-white font-bold tracking-wide focus:outline-none focus:border-neon-pink transition-colors"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-6 pt-4">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 bg-neon-pink text-white py-5 font-heading text-2xl uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ROTATE KEYS'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelPassword}
                          className="px-10 py-5 bg-transparent border border-white/20 font-heading text-xl text-white uppercase tracking-widest hover:border-white transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" /> CANCEL
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-black/40 border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-white/20 transition-all">
                      <div className="flex items-start gap-6">
                        <div className="bg-white/5 p-4 hidden sm:block">
                          <ShieldCheck className="w-8 h-8 text-white/50 group-hover:text-neon-pink transition-colors" />
                        </div>
                        <div>
                          <p className="text-xl font-heading uppercase tracking-widest text-white mb-2">UPDATE SECURITY CREDENTIALS</p>
                          <p className="text-white/40 font-bold text-xs uppercase tracking-widest max-w-md leading-relaxed">
                            REGULARLY ROTATE YOUR PASSWORD TO MAINTAIN MAXIMUM CLEARANCE AND PROTECT YOUR DIGITAL ASSETS.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsChangingPassword(true);
                          setIsEditing(false);
                        }}
                        className="bg-transparent border border-white/30 text-white px-8 py-4 font-heading uppercase text-xl tracking-widest hover:border-neon-pink hover:text-neon-pink transition-all flex-shrink-0"
                      >
                        CHANGE PASSWORD
                      </button>
                    </div>
                  )}
                </section>

                {/* Orders Section */}
                <section className="pt-16 border-t border-white/10">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-heading uppercase tracking-tighter text-white flex items-center gap-4">
                      <span className="w-8 h-1 bg-neon-yellow"></span>
                      TRANSACTION LOG
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    {orders.length === 0 ? (
                      <div className="p-16 border border-white/5 bg-black/50 text-center">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-white/20" />
                        <p className="font-heading text-2xl uppercase tracking-widest text-white/40">NO TRANSACTIONS FOUND</p>
                      </div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="bg-black border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-white/30 transition-colors">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 border flex items-center justify-center text-3xl font-heading ${
                              order.status?.toLowerCase() === 'paid' ? 'border-neon-cyan/50 text-neon-cyan' : 
                              order.status?.toLowerCase() === 'expired' ? 'border-neon-pink/50 text-neon-pink' : 
                              'border-neon-yellow/50 text-neon-yellow'
                            }`}>
                              {order.status?.toLowerCase() === 'paid' ? '✔' : 
                               order.status?.toLowerCase() === 'expired' ? 'X' : '...'}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-1">
                                REF: ORDER-{order.id.slice(0, 8)}
                              </p>
                              <h3 className="font-heading text-xl uppercase tracking-widest text-white">
                                {order.order_items?.[0]?.item_name || 'UNDEFINED ITEM'} 
                                {(order.order_items?.length || 0) > 1 && ' [+MORE]'}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-12">
                            <div className="text-right">
                               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-1">VALUE</p>
                               <p className="font-heading text-2xl tracking-widest text-white">
                                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total_amount)}
                               </p>
                            </div>
                            <span className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border ${
                              order.status?.toLowerCase() === 'paid' ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan' : 
                              order.status?.toLowerCase() === 'expired' ? 'bg-neon-pink/10 border-neon-pink text-neon-pink' :
                              'bg-neon-yellow/10 border-neon-yellow text-neon-yellow'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;
