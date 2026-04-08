import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { orderApi, authApi } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Ticket, AlertCircle, ShoppingCart, Loader2, User, Info, ShieldCheck } from 'lucide-react';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, clearCart, getTotalPrice } = useCart();
  const currentUser = authApi.getUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Directly buying one item?
  const directTicketId = searchParams.get('ticketId');
  const directMerchId = searchParams.get('merchId');
  const directName = searchParams.get('name') || 'Item';
  const directPriceStr = searchParams.get('price');
  const directPrice = directPriceStr ? parseInt(directPriceStr, 10) : 0;
  const directQtyStr = searchParams.get('qty');
  const directQty = directQtyStr ? parseInt(directQtyStr, 10) : 1;

  const isDirectBuy = !!(directTicketId || directMerchId);
  const checkoutItems = isDirectBuy 
    ? [{ 
        id: parseInt((directTicketId || directMerchId) as string), 
        type: (directTicketId ? 'ticket' : 'merchandise') as 'ticket' | 'merchandise', 
        name: directName, 
        price: directPrice, 
        quantity: directQty 
      }] 
    : items;

  const PPN_RATE = 0.11; // 11%
  const subtotal = isDirectBuy ? (directPrice * directQty) : getTotalPrice();
  const ppn = subtotal * PPN_RATE;
  const total = subtotal + ppn;

  useEffect(() => {
    if (!isDirectBuy && items.length === 0) {
      navigate('/');
    }
  }, [isDirectBuy, items, navigate]);

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ticket_items = checkoutItems
        .filter(i => i.type === 'ticket')
        .map(i => ({ ticket_type_id: i.id as number, quantity: i.quantity }));
      
      const merchandise_items = checkoutItems
        .filter(i => i.type === 'merchandise')
        .map(i => ({ merchandise_id: i.id as number, quantity: i.quantity }));

      const order = await orderApi.createOrder({
        items: [], // Legacy field
        ticket_items,
        merchandise_items,
        payment_method: 'xendit'
      });

      if (!isDirectBuy) {
        clearCart();
      }

      if (order.payment?.checkout_url) {
        window.location.href = order.payment.checkout_url;
      } else {
        setError('Checkout URL not found from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process order.');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-black grid-background font-sans text-white selection:bg-neon-pink selection:text-white py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <Link to="/" className="inline-flex items-center text-white/50 hover:text-neon-cyan font-bold uppercase tracking-[0.2em] mb-12 transition-all">
            <ArrowLeft className="w-5 h-5 mr-3" /> BACK TO STORE
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
            {/* Left: Summary */}
            <div className="lg:col-span-7">
              <div className="mb-16">
                 <h1 className="text-6xl md:text-8xl font-heading uppercase tracking-tighter text-white leading-none">
                   CHECK<span className="text-outline">OUT</span>
                 </h1>
                 <div className="flex items-center gap-4 mt-8">
                    <span className="h-1 w-24 bg-neon-cyan"></span>
                    <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs">SECURE EXCHANGE PROTOCOL</p>
                 </div>
              </div>

              {error && (
                <div className="bg-dark-grey border border-neon-pink p-6 mb-12 flex items-center gap-4">
                  <AlertCircle className="w-8 h-8 flex-shrink-0 text-neon-pink" />
                  <p className="font-bold uppercase tracking-widest text-sm text-neon-pink">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
                   <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">ORDER ITEMS</span>
                   <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">{checkoutItems.length} PRODUCTS</span>
                </div>
                
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="group flex items-center gap-6 bg-dark-grey border border-white/5 p-6 hover:border-white/20 transition-all">
                    <div className="w-20 h-20 bg-black border border-white/10 flex items-center justify-center group-hover:border-neon-cyan transition-colors">
                      <span className="text-4xl">{item.type === 'ticket' ? '🎫' : '📦'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 ${item.type === 'ticket' ? 'bg-neon-pink/10 text-neon-pink' : 'bg-neon-cyan/10 text-neon-cyan'}`}>
                          {item.type}
                        </span>
                      </div>
                      <h3 className="font-heading uppercase text-2xl tracking-widest text-white leading-none mb-2">{item.name}</h3>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                        QTY: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-3xl tracking-tighter text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 bg-dark-grey border border-white/10 p-10">
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-white/60">
                    <span className="font-bold uppercase tracking-[0.2em] text-sm">SUBTOTAL</span>
                    <span className="font-heading text-2xl tracking-widest">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                    <span className="font-bold uppercase tracking-[0.2em] text-sm">TAX (11%)</span>
                    <span className="font-heading text-2xl tracking-widest">{formatPrice(ppn)}</span>
                  </div>
                </div>
                
                <div className="relative pt-8 border-t border-white/10">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                     <div className="w-full md:flex-1">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-neon-pink mb-2 block">TOTAL DUE</span>
                        <span className="text-6xl font-heading tracking-tighter text-white">{formatPrice(total)}</span>
                     </div>
                     <div className="flex items-center gap-6 w-full md:w-auto bg-black p-4 border border-white/5">
                        <div className="text-right">
                           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1">PROCESSED BY</p>
                           <p className="font-heading text-xl uppercase tracking-widest text-white/80">XENDIT</p>
                        </div>
                        <div className="w-12 h-12 bg-white/5 flex items-center justify-center">
                          <ShieldCheck className="text-neon-cyan w-6 h-6" />
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Sidebar */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="sticky top-12 bg-black border border-white/10 p-10">
                
                <h2 className="text-4xl font-heading uppercase tracking-widest mb-12 flex items-center justify-between">
                  PAYMENT
                  <span className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse"></span>
                </h2>

                {!currentUser ? (
                  <div className="space-y-8">
                    <div className="bg-dark-grey border border-white/5 p-8">
                       <p className="font-heading text-2xl uppercase mb-4 text-white">AUTHENTICATION REQUIRED</p>
                       <p className="font-bold text-sm text-white/40 leading-relaxed tracking-wide uppercase">
                         Please sign in to proceed. Your tickets and order history will be securely linked to your account.
                       </p>
                    </div>
                    <Link 
                      to="/login"
                      className="block w-full bg-white text-black py-6 font-heading text-2xl uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all text-center"
                    >
                      LOGIN TO CONTINUE
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="flex items-start gap-6 bg-dark-grey border border-white/5 p-6">
                       <div className="w-16 h-16 bg-black flex items-center justify-center border border-white/10">
                          <User className="text-white/50 w-8 h-8" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">RECIPIENT FILE</p>
                          <p className="font-heading text-2xl uppercase tracking-widest text-white mb-1 truncate max-w-[200px]">{currentUser.name}</p>
                          <p className="text-xs font-bold text-neon-cyan tracking-wider">{currentUser.email}</p>
                       </div>
                    </div>

                    <div className="border border-white/10 p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-6">
                        TRANSACTION PROTOCOL
                      </p>
                      <ul className="text-xs font-bold space-y-4 tracking-[0.1em] text-white/70 uppercase">
                        <li className="flex items-center gap-4">
                          <span className="text-neon-cyan">/</span> INSTANT E-TICKET DELIVERY
                        </li>
                        <li className="flex items-center gap-4">
                          <span className="text-neon-cyan">/</span> SUPPORTS VA, CC, & QRIS
                        </li>
                        <li className="flex items-center gap-4">
                          <span className="text-neon-cyan">/</span> 11% TAX INCLUDED
                        </li>
                      </ul>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-white text-black py-6 font-heading text-3xl uppercase tracking-widest hover:bg-neon-cyan transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin w-8 h-8" />
                          <span>PROCESSING...</span>
                        </>
                      ) : (
                        <>
                          <span>AUTHORIZE</span>
                          <ArrowLeft className="w-6 h-6 rotate-180" />
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-4 opacity-30 mt-8">
                      <div className="h-[1px] w-12 bg-white"></div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                        SSL ENCRYPTED
                      </p>
                      <div className="h-[1px] w-12 bg-white"></div>
                    </div>
                  </div>
                )}
                
                {/* Demand Warning */}
                <div className="mt-12 bg-neon-yellow/10 border border-neon-yellow p-6 flex gap-6">
                   <div className="w-12 h-12 bg-black border border-neon-yellow flex items-center justify-center flex-shrink-0">
                     <AlertCircle className="text-neon-yellow w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon-yellow mb-2">
                        HIGH DEMAND ALERT
                      </p>
                      <p className="text-xs font-bold text-white/60 uppercase leading-relaxed tracking-wider">
                        ITEMS IN CART ARE NOT RESERVED. OVER 200 PEOPLE ARE CURRENTLY VIEWING THIS ITEM.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
