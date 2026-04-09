import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Box, Loader2 } from 'lucide-react';
import { adminApi } from '@/services/api';
import type { Merchandise } from '@/types';
import { formatImageURL } from '@/lib/utils';

const MerchList: React.FC = () => {
  const navigate = useNavigate();
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    setLoading(true);
    try {
      const resp: any = await adminApi.getAllMerchandise();
      const merchData = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
      setMerchandise(merchData);
    } catch (error) {
      console.error("Failed to fetch merchandise", error);
      setMerchandise([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    try {
      await adminApi.deleteMerchandise(id);
      fetchMerch();
    } catch (error) {
      alert("Failed to delete merchandise");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Store</h2>
          <p className="text-slate-500 text-sm">Monitor stock levels and physical merchandise assets.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/merch/create')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 w-fit"
        >
          <Plus size={20} /> Add New Merch
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10 mb-4" />
            <p className="text-slate-400 font-medium">Updating inventory...</p>
          </div>
        ) : !Array.isArray(merchandise) || merchandise.length === 0 ? (
          <div className="p-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
             <Package className="w-16 h-16 mx-auto mb-6 text-slate-200" />
             <p className="text-xl font-bold text-slate-900">No merchandise found.</p>
             <p className="text-slate-500 mt-2">Initialize your production line to list items here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {merchandise.map(item => (
              <div key={item.id} className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-md transition-all">
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 flex items-center justify-center relative">
                      {item.image_url ? (
                        <img 
                          src={formatImageURL(item.image_url)} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-slate-200" />
                      )}
                      {item.stock < 10 && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-bold uppercase rounded-md">Low Stock</div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU: {item.slug?.toUpperCase() || `#MRC-${item.id}`}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                          item.active_status 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.active_status ? 'Active' : 'Draft'}
                        </span>
                     </div>
                     <h3 className="text-lg font-bold text-slate-900 truncate">{item.name}</h3>
                     <div className="flex flex-wrap items-center gap-6 mt-2">
                        <div className="space-y-0.5">
                           <p className="text-[9px] font-bold text-slate-400 tracking-wider">UNIT PRICE</p>
                           <p className="text-sm font-bold text-slate-900">IDR {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                           <Box size={14} className={item.stock < 10 ? 'text-red-500' : ''} />
                           <span className={`text-xs font-bold ${item.stock < 10 ? 'text-red-500' : ''}`}>
                             {item.stock} Units
                           </span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   <button 
                     onClick={() => navigate(`/admin/merch/edit/${item.id}`)}
                     className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
                   >
                     Edit Specs
                   </button>
                   <button 
                     onClick={() => handleDelete(item.id)}
                     className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 font-bold text-xs rounded-lg transition-colors border border-red-100"
                   >
                     Remove
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchList;
