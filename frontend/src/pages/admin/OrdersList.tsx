import React, { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import type { Order } from '@/types';
import { CreditCard, ShoppingBag, Clock, X, ShieldCheck, Printer, Loader2 } from 'lucide-react';

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderID, setSelectedOrderID] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    adminApi.getAllOrders()
      .then((res: any) => {
        const orderData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setOrders(orderData);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  const selectedOrder = (Array.isArray(orders) ? orders : []).find(o => o.id === selectedOrderID);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Order Logs</h2>
          <p className="text-slate-500 text-sm">Review transaction history and fulfillment status.</p>
        </div>
        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
           <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Records</p>
           <p className="text-xl font-bold text-indigo-600">{(Array.isArray(orders) ? orders : []).length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10 mb-4" />
            <p className="text-slate-400 font-medium">Fetching manifests...</p>
          </div>
        ) : (!Array.isArray(orders) || orders.length === 0) ? (
          <div className="p-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
             <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-slate-200" />
             <p className="text-xl font-bold text-slate-900">No transactions recorded.</p>
             <p className="text-slate-500 mt-2">Active sales will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map(order => {
              const isTicket = order.order_items?.[0]?.item_type === 'ticket';
              return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrderID(order.id)}
                  className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6 flex-1 w-full">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-xl text-indigo-600 border border-slate-100">
                       {order.user?.name?.substring(0, 1).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HASH: {order.id.slice(-8).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                            order.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                            order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {order.status}
                          </span>
                       </div>
                       <h3 className="text-lg font-bold text-slate-900 truncate">{order.user?.name || 'Guest User'}</h3>
                       <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-slate-500">
                             <Clock size={14} />
                             <span className="text-xs font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                             {isTicket ? <CreditCard size={14} /> : <ShoppingBag size={14} />}
                             <span className="text-xs font-medium truncate">
                                {order.order_items?.[0]?.item_name || 'Multiple Items'}
                             </span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                     <div className="text-left md:text-right flex-1">
                        <p className="text-[9px] font-bold text-slate-400 tracking-wider">VALUE</p>
                        <p className="text-lg font-bold text-slate-900 leading-none">IDR {order.total_amount.toLocaleString()}</p>
                     </div>
                     <button className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors border border-indigo-100">
                        Details
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal remains largely the same but adapted for light theme */}
      {selectedOrderID && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedOrderID(null)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
             <button onClick={() => setSelectedOrderID(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-all"><X size={24} /></button>

             <div className="space-y-8">
                <div className="border-b border-slate-100 pb-6">
                   <p className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest mb-1">Analysis Manifest</p>
                   <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Order Details</h2>
                   <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-tight">HASH: {selectedOrder.id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer</p>
                         <h4 className="text-xl font-bold text-slate-900">{selectedOrder.user?.name || 'Guest'}</h4>
                         <p className="text-sm text-slate-500 italic mt-1">{selectedOrder.user?.email}</p>
                         <div className="pt-4 flex items-center gap-2 text-indigo-600 bg-white mt-4 p-2 rounded-lg border border-slate-100">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Verified Log</span>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-2 ${
                        selectedOrder.status === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                      }`}>
                         <p className="text-[10px] font-bold uppercase tracking-widest">Current Status</p>
                         <p className="text-3xl font-bold uppercase tracking-tight">{selectedOrder.status}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manifest Payload</p>
                   <div className="space-y-3">
                      {selectedOrder.order_items?.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white border border-slate-100 flex items-center justify-center rounded-lg text-lg font-bold">
                                  {item.item_type === 'ticket' ? 'T' : 'M'}
                                </div>
                               <div>
                                  <p className="font-bold text-slate-900 leading-none">{item.item_name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">QTY: {item.quantity}</p>
                               </div>
                            </div>
                            <p className="font-bold text-slate-900">IDR {item.price_per_item.toLocaleString()}</p>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-end justify-between gap-6">
                   <div className="w-full md:w-auto">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-4xl font-bold text-slate-900 tracking-tight">IDR {selectedOrder.total_amount.toLocaleString()}</p>
                   </div>
                   <button 
                     onClick={() => window.print()}
                     className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                   >
                     <Printer size={20} /> Print Manifest
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;
