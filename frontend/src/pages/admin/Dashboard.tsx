import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Package, 
  Clock, 
  ArrowUpRight,
  Monitor,
  Loader2,
  Users,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '@/services/api';
import type { DashboardSummaryResponse, Order } from '@/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboardSummary().catch(() => null),
      adminApi.getAllOrders({ limit: 5 }).catch(() => ({ data: [] }))
    ]).then(([summaryData, ordersData]) => {
      if (summaryData) setSummary(summaryData);
      setRecentOrders(ordersData?.data || []);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      title: "Total Revenue",
      value: `IDR ${(summary?.revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "+12.5%"
    },
    {
      title: "Transactions",
      value: (summary as any)?.total_orders || 0,
      icon: CreditCard,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      trend: "+5.2%"
    },
    {
      title: "Active Events",
      value: summary?.active_events || 0,
      icon: Calendar,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: "Stable"
    },
    {
      title: "Stock Items",
      value: (summary as any)?.total_merchandise || 0,
      icon: Package,
      color: "text-rose-600",
      bg: "bg-rose-50",
      trend: "Alert"
    }
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Strategic overview of your event commerce ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Live</span>
           </div>
           <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 text-slate-400">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
           </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-7 rounded-[28px] shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
             <div className="absolute -right-2 -top-2 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                   <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} shadow-sm`}>
                      <stat.icon size={22} />
                   </div>
                   <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                      stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                   }`}>{stat.trend}</span>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                   {loading ? (
                     <div className="h-8 w-32 bg-slate-50 animate-pulse rounded-lg mt-1" />
                   ) : (
                     <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Transactions List (Refactored to Cards) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
              <Link to="/admin/orders" className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                 <ArrowUpRight size={18} />
              </Link>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 bg-white border border-slate-100 rounded-3xl animate-pulse" />
                ))
              ) : (!Array.isArray(recentOrders) || recentOrders.length === 0) ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No transaction data available.</p>
                </div>
              ) : (
                recentOrders.map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => navigate('/admin/orders')}
                    className="bg-white border border-slate-100 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer"
                  >
                     <div className="flex items-center gap-5 flex-1 w-full">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-lg text-indigo-600 border border-slate-100">
                           {order.user?.name?.substring(0, 1).toUpperCase() || 'G'}
                        </div>
                        <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ORD-{order.id.slice(-6).toUpperCase()}</span>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                 order.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`} />
                           </div>
                           <h4 className="font-bold text-slate-900 text-md truncate">{order.user?.name || 'Customer'}</h4>
                           <p className="text-[10px] text-slate-400 font-medium truncate">{order.user?.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Payment</p>
                           <p className="text-lg font-bold text-slate-900 leading-none">IDR {order.total_amount.toLocaleString()}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                           <ChevronRight size={18} />
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Quick Actions & Ecosystem */}
        <div className="space-y-8">
           <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 px-2">Launch Center</h3>
              <div className="grid grid-cols-1 gap-4">
                 <Link to="/admin/events/create" className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-white/20 rounded-2xl">
                       <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-md leading-none">Host New Event</p>
                       <p className="text-[10px] text-white/60 font-medium mt-1 uppercase tracking-widest">Deploy manifest</p>
                    </div>
                 </Link>
                 <Link to="/admin/merch/create" className="p-5 bg-white border border-slate-100 text-slate-900 rounded-3xl shadow-sm hover:shadow-md hover:border-rose-100 transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                       <Package size={20} />
                    </div>
                    <div>
                       <p className="font-bold text-md leading-none">List Inventory</p>
                       <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Update store items</p>
                    </div>
                 </Link>
                 <Link to="/" className="p-5 bg-white border border-slate-100 text-slate-900 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:scale-110 transition-transform">
                       <Monitor size={20} />
                    </div>
                    <div>
                       <p className="font-bold text-md leading-none">Portal View</p>
                       <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">Frontend experience</p>
                    </div>
                 </Link>
              </div>
           </div>

           {/* Quick Stats Card */}
           <div className="bg-indigo-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <Users size={18} className="text-indigo-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Audience Pulse</span>
                 </div>
                 <div>
                    <p className="text-4xl font-bold">1.2k</p>
                    <p className="text-xs text-indigo-300/60 font-medium mt-1">Unique visitors this week</p>
                 </div>
                 <div className="h-px bg-white/10" />
                 <p className="text-[10px] text-indigo-300/40 italic leading-relaxed">
                    Traffic is up by 8% compared to the previous period. Monitor your event SEO in the analytics tab.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
