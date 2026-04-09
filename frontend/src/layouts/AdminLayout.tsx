import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, CalendarDays, ShoppingCart, Package } from 'lucide-react';
import { authApi } from '@/services/api';
import logoImg from '@/assets/images/klix-logo.webp';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authApi.getUser();

  useEffect(() => {
    if (!authApi.isLoggedIn()) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const navLinks = [
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/events', name: 'Events', icon: <CalendarDays size={18} /> },
    { path: '/admin/merchandise', name: 'Merchandise', icon: <Package size={18} /> },
    { path: '/admin/orders', name: 'Orders', icon: <ShoppingCart size={18} /> },
  ];

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-slate-50/30 text-slate-900 font-sans flex overflow-hidden">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-8 right-8 z-[60] w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all"
      >
        <Menu size={24} />
      </button>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-500 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col shadow-2xl lg:shadow-none`}>
        {/* Branding */}
        <div className="h-24 flex items-center px-8">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
             <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-600/20">
                <img src={logoImg} alt="Klix" className="w-6 h-6 object-contain invert" />
             </div>
             <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none block">Klix<span className="text-indigo-600">Ticket</span></span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Admin Control</span>
             </div>
          </Link>
          <button className="lg:hidden ml-auto p-2 text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setSidebarOpen(false)}>
             <X size={20} />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
          <p className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Hub</p>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                  {link.icon}
                </div>
                {link.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Stats/Shortcuts placeholder */}
        <div className="px-6 py-4">
           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Load</p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 rounded-full transition-all" style={{width: '24%'}} />
              </div>
           </div>
        </div>

        {/* User Card */}
        <div className="p-6 border-t border-slate-50">
           <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                 {user?.name?.substring(0, 1).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 pr-2">
                 <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{user?.name || 'Admin User'}</p>
                 <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email}</p>
              </div>
           </div>
           
           <button 
             onClick={handleLogout}
             className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
           >
              <LogOut size={14} />
              Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 lg:p-14 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
