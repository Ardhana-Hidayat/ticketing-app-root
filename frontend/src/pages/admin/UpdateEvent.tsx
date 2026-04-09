import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '@/services/api';
import { formatImageURL } from '@/lib/utils';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Upload, 
  Calendar, 
  MapPin, 
  Ticket as TicketIcon, 
  Loader2, 
  Save,
  Info,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Type
} from 'lucide-react';
import { RequestError } from '@/lib/api-client';

const UpdateEvent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
  });

  const [ticketTiers, setTicketTiers] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
       fetchEvent(parseInt(id));
    }
  }, [id]);

  const fetchEvent = async (eventId: number) => {
    try {
      const res: any = await adminApi.getEventById(eventId);
      const data = res;
      
      setEventData({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
        end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
      });

      if (data.banner_url) {
        setPreviewUrl(formatImageURL(data.banner_url));
      }

      if (data.ticket_types) {
        setTicketTiers(data.ticket_types.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          price: t.price,
          quota: t.quota,
          sales_start_at: t.sales_start_at ? new Date(t.sales_start_at).toISOString().slice(0, 16) : '',
          sales_end_at: t.sales_end_at ? new Date(t.sales_end_at).toISOString().slice(0, 16) : '',
        })));
      }
    } catch (err: any) {
      setGeneralError('Failed to access event records. Return to manifest.');
      setTimeout(() => navigate('/admin/events'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (fieldErrors[e.target.name]) {
       const newErrors = { ...fieldErrors };
       delete newErrors[e.target.name];
       setFieldErrors(newErrors);
    }
  };

  const handleTierChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newTiers = [...ticketTiers];
    const { name, value } = e.target;
    newTiers[index] = { ...newTiers[index], [name]: value };
    setTicketTiers(newTiers);
  };

  const addTier = () => {
    setTicketTiers([...ticketTiers, { name: '', description: '', price: '', quota: '', sales_start_at: '', sales_end_at: '' }]);
  };

  const removeTier = (index: number) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (fieldErrors['banner']) {
          const newErrors = { ...fieldErrors };
          delete newErrors['banner'];
          setFieldErrors(newErrors);
       }
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    setFieldErrors({});
    setGeneralError('');
    setSaving(true);
    
    try {
      const ticketTypes = ticketTiers.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        price: Number(t.price),
        quota: Number(t.quota),
        sales_start_at: t.sales_start_at ? new Date(t.sales_start_at).toISOString() : '',
        sales_end_at: t.sales_end_at ? new Date(t.sales_end_at).toISOString() : '',
        active_status: true,
      }));

      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('location', eventData.location);
      formData.append('start_date', eventData.start_date ? new Date(eventData.start_date).toISOString() : '');
      formData.append('end_date', eventData.end_date ? new Date(eventData.end_date).toISOString() : '');
      formData.append('publish_status', 'published');
      formData.append('ticket_types', JSON.stringify(ticketTypes));
      
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      await adminApi.updateEvent(parseInt(id), formData);
      navigate('/admin/events');
    } catch (err: any) {
      if (err instanceof RequestError && err.errors) {
        setFieldErrors(err.errors);
        setGeneralError('Validation mismatch. Correct the highlighted parameters.');
      } else {
        setGeneralError(err.message || 'System error while updating event node.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-6" />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Accessing Database Manifest...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin/events')}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
            >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Record Modification</span>
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Modify Event #{id}</h2>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/events')}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all font-sans"
            >
               Discard
            </button>
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="px-10 py-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-3 active:scale-95 font-sans"
            >
               {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               Commit Changes
            </button>
         </div>
      </div>

      {generalError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-2">
           <AlertCircle size={20} />
           <p className="text-sm font-bold uppercase tracking-wider">{generalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
         <div className="lg:col-span-8 space-y-8">
            
            {/* 01. Logic Overlay */}
            <div className={`bg-white border rounded-[32px] p-10 shadow-sm transition-all ${generalError ? 'ring-1 ring-rose-100' : 'border-slate-100'}`}>
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                     <Type size={20} />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Core Configuration</h3>
                     <p className="text-slate-400 text-xs font-medium">Update primary descriptors for the event node.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">strategic Title</label>
                     <input 
                        name="title"
                        value={eventData.title}
                        onChange={handleEventChange}
                        className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-lg font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${fieldErrors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                     />
                     {fieldErrors.title && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.title}</p>}
                  </div>
                  
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Narrative Overview</label>
                     <textarea 
                        name="description"
                        rows={6}
                        value={eventData.description}
                        onChange={handleEventChange}
                        className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none ${fieldErrors.description ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                     />
                     {fieldErrors.description && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-3 md:col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <MapPin size={12} className="text-rose-400" /> Vector Location
                        </label>
                        <input 
                           name="location"
                           value={eventData.location}
                           onChange={handleEventChange}
                           className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${fieldErrors.location ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                        />
                        {fieldErrors.location && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.location}</p>}
                     </div>
                     <div className="space-y-3 md:col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Calendar size={12} className="text-emerald-400" /> magnitude Start
                        </label>
                        <input 
                           name="start_date"
                           type="datetime-local"
                           value={eventData.start_date}
                           onChange={handleEventChange}
                           className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${fieldErrors.start_date ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                        />
                     </div>
                     <div className="space-y-3 md:col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Calendar size={12} className="text-rose-400" /> Final Close
                        </label>
                        <input 
                           name="end_date"
                           type="datetime-local"
                           value={eventData.end_date}
                           onChange={handleEventChange}
                           className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-sans text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all ${fieldErrors.end_date ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-200'}`} 
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* 02. Ticket Architecture */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm">
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                        <TicketIcon size={20} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Access Tiers</h3>
                        <p className="text-slate-400 text-xs font-medium">Managing unit capacities and valuations.</p>
                     </div>
                  </div>
                  <button 
                     onClick={addTier}
                     className="px-6 py-3 bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2"
                  >
                     <Plus size={14} /> Expand Tiers
                  </button>
               </div>

               <div className="space-y-10">
                  {ticketTiers.map((tier, idx) => (
                     <div key={idx} className="p-10 bg-slate-50 rounded-[40px] relative border border-slate-100 shadow-inner">
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-black text-white font-black flex items-center justify-center rounded-2xl shadow-xl text-xs">
                           0{idx + 1}
                        </div>
                        {ticketTiers.length > 1 && (
                           <button 
                              onClick={() => removeTier(idx)}
                              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                           >
                              <X size={20} />
                           </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bracket Name</label>
                              <input 
                                 name="name"
                                 value={tier.name}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 shadow-sm" 
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pricing (IDR)</label>
                              <input 
                                 name="price"
                                 type="number"
                                 value={tier.price}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 shadow-sm" 
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unit Inventory</label>
                              <input 
                                 name="quota"
                                 type="number"
                                 value={tier.quota}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 shadow-sm" 
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Window open</label>
                              <input 
                                 name="sales_start_at"
                                 type="datetime-local"
                                 value={tier.sales_start_at}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 shadow-sm" 
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Window close</label>
                              <input 
                                 name="sales_end_at"
                                 type="datetime-local"
                                 value={tier.sales_end_at}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-300 shadow-sm" 
                              />
                           </div>
                           <div className="space-y-3 col-span-full">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-indigo-400">Modification Notes (Optional)</label>
                              <textarea 
                                 name="description"
                                 rows={2}
                                 value={tier.description}
                                 onChange={(e) => handleTierChange(idx, e)}
                                 className="w-full bg-white border border-slate-200 px-5 py-3 rounded-xl text-sm text-slate-600 outline-none focus:border-indigo-300 shadow-sm resize-none" 
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Sidebar */}
         <div className="lg:col-span-4 space-y-8">
            <div className={`bg-white border rounded-[32px] p-10 shadow-sm transition-all ${fieldErrors.banner ? 'border-rose-300 bg-rose-50' : 'border-slate-100'}`}>
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                     <Upload size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">Visual Identity</h3>
               </div>

               <div className="space-y-6">
                  <div className="relative aspect-[16/10] w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden group hover:border-indigo-400 transition-all cursor-pointer">
                     {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                           <Upload size={48} className="text-slate-200 mb-4" />
                           <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Update Branding</p>
                        </div>
                     )}
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                     />
                  </div>
                  
                  {fieldErrors.banner && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider text-center">{fieldErrors.banner}</p>}

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                     <CheckCircle2 size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                     <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                        Node visuals will be synchronized across the marketplace grid.
                     </p>
                  </div>

                  <button 
                     onClick={handleSubmit}
                     disabled={saving}
                     className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                     {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                     Commit Update
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UpdateEvent;
