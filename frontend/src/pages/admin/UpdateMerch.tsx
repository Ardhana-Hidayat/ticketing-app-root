import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '@/services/api';
import { formatImageURL } from '@/lib/utils';
import { 
  ArrowLeft, 
  Package, 
  Upload, 
  Save, 
  Loader2, 
  Info, 
  CheckCircle2,
  Tag,
  Box,
  Hash,
  AlertCircle,
  Shapes,
  FileEdit
} from 'lucide-react';
import { RequestError } from '@/lib/api-client';

const UpdateMerch: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    active_status: true
  });

  useEffect(() => {
    if (id) {
       fetchMerch(parseInt(id));
    }
  }, [id]);

  const fetchMerch = async (merchId: number) => {
    try {
      const res: any = await adminApi.getMerchById(merchId);
      const data = res;
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        price: data.price !== undefined ? String(data.price) : '',
        stock: data.stock !== undefined ? String(data.stock) : '',
        active_status: data.active_status ?? true
      });
      if (data.image_url) {
        setPreviewUrl(formatImageURL(data.image_url));
      }
    } catch (err: any) {
      setGeneralError('Product record access failed. Returning to store.');
      setTimeout(() => navigate('/admin/merchandise'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
    if (fieldErrors[name]) {
       const newErrors = { ...fieldErrors };
       delete newErrors[name];
       setFieldErrors(newErrors);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
       if (fieldErrors['image']) {
          const newErrors = { ...fieldErrors };
          delete newErrors['image'];
          setFieldErrors(newErrors);
       }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id) return;
    
    setFieldErrors({});
    setGeneralError('');
    setSaving(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('slug', formData.slug);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('active_status', String(formData.active_status));
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await adminApi.updateMerchandise(parseInt(id), data as any);
      navigate('/admin/merchandise');
    } catch (err: any) {
      if (err instanceof RequestError && err.errors) {
        setFieldErrors(err.errors);
        setGeneralError('Attribute collision detect. Correct highlighted nodes.');
      } else {
        setGeneralError(err.message || 'The system could not commit update to product node.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-6" />
        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Navigating Inventory Sector...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin/merchandise')}
              className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
            >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Modification</span>
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-tight">Modify Asset #{id}</h2>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/merchandise')}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all font-sans"
            >
               Discard
            </button>
            <button 
              onClick={() => handleSubmit()}
              disabled={saving}
              className="px-10 py-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-3 active:scale-95 font-sans"
            >
               {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               Commit Update
            </button>
         </div>
      </div>

      {generalError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-2">
           <AlertCircle size={20} />
           <p className="text-sm font-bold uppercase tracking-wider">{generalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 font-sans">
        
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-10">
          <form id="merch-form" onSubmit={handleSubmit} className={`bg-white border p-10 md:p-12 rounded-[32px] shadow-sm space-y-12 transition-all ${generalError ? 'border-rose-300 shadow-rose-600/5' : 'border-slate-100 shadow-2xl shadow-indigo-600/5'}`}>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                   <FileEdit size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase">Modify Specifications</h3>
                   <p className="text-slate-400 text-xs font-medium">Update the properties for product node #{id}.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Tag size={12} className="text-indigo-400" /> Strategic Identity <span className="text-rose-500">*</span>
                   </label>
                   <input 
                     name="name" 
                     value={formData.name} 
                     onChange={handleInputChange} 
                     className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all ${fieldErrors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-600'}`}
                     placeholder="Product Name"
                     required
                   />
                   {fieldErrors.name && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Hash size={12} className="text-indigo-400" /> Reference Slug
                   </label>
                   <input 
                     name="slug" 
                     value={formData.slug} 
                     onChange={handleInputChange} 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
                   />
                </div>

                <div className="md:col-span-2 space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Narrative</label>
                   <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-slate-600 outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all resize-none font-medium"
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Valuation (IDR) <span className="text-rose-500">*</span></label>
                   <input 
                    name="price" 
                    type="number"
                    value={formData.price} 
                    onChange={handleInputChange} 
                    className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all ${fieldErrors.price ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-600'}`}
                    required
                   />
                   {fieldErrors.price && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.price}</p>}
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Box size={12} className="text-indigo-400" /> Inventory Sector Stock <span className="text-rose-500">*</span>
                   </label>
                   <input 
                     name="stock" 
                     type="number"
                     value={formData.stock} 
                     onChange={handleInputChange} 
                     className={`w-full bg-slate-50 border px-6 py-5 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all ${fieldErrors.stock ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-indigo-600'}`}
                     required
                   />
                   {fieldErrors.stock && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">{fieldErrors.stock}</p>}
                </div>
             </div>

             <div className="pt-8 border-t border-slate-50">
                <label className="inline-flex items-center cursor-pointer group p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100">
                  <input 
                    type="checkbox" 
                    name="active_status" 
                    checked={formData.active_status} 
                    onChange={handleInputChange}
                    className="sr-only peer" 
                  />
                  <div className="relative w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-sm"></div>
                  <span className="ms-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">Visibility status LIVE</span>
                </label>
             </div>
          </form>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-10">
           <div className={`bg-white border rounded-[40px] p-8 shadow-sm space-y-10 sticky top-28 transition-all ${fieldErrors.image ? 'border-rose-300 bg-rose-50' : 'border-slate-100 shadow-2xl shadow-indigo-600/5'}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Hero Media</h4>
                <Upload size={14} className="text-slate-400" />
              </div>

              <div className="space-y-6 text-center">
                 <div className="aspect-square bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 relative group flex items-center justify-center cursor-pointer">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Preview" />
                    ) : (
                      <div className="p-10 flex flex-col items-center">
                         <Package size={64} className="text-slate-100 mb-4 group-hover:-translate-y-2 transition-transform" />
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Update Asset Visual</p>
                      </div>
                    )}
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                 </div>
                 {fieldErrors.image && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{fieldErrors.image}</p>}
                 <p className="text-[9px] text-slate-400 font-medium italic">Modifications propagate instantly to the storefront.</p>
              </div>

              <button 
                onClick={() => handleSubmit()}
                disabled={saving}
                className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                 {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 Commit Update
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateMerch;
