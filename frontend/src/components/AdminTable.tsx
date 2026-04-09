import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';

interface AdminTableProps {
  headers: string[];
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export const AdminTable: React.FC<AdminTableProps> = ({ 
  headers, 
  isLoading, 
  isEmpty, 
  emptyMessage = "No records found.",
  children 
}) => {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {headers.map((header, idx) => (
                <th key={idx} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  {header}
                </th>
              ))}
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={headers.length + 1} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                     <div className="w-12 h-12 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                     <span className="font-heading text-xl uppercase tracking-widest text-neon-cyan opacity-40">Syncing Catalog...</span>
                  </div>
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={headers.length + 1} className="px-8 py-32 text-center text-white/20 font-heading text-2xl uppercase tracking-widest">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete, onView }) => {
  return (
    <div className="flex items-center justify-end gap-3">
      {onView && (
        <button 
          onClick={onView}
          className="p-3 bg-white/5 hover:bg-neon-cyan/20 border border-white/5 hover:border-neon-cyan text-white/40 hover:text-neon-cyan transition-all rounded-xl group"
          title="View Details"
        >
          <Eye size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
      {onEdit && (
        <button 
          onClick={onEdit}
          className="p-3 bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500 text-white/40 hover:text-amber-500 transition-all rounded-xl group"
          title="Edit Record"
        >
          <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
      {onDelete && (
        <button 
          onClick={onDelete}
          className="p-3 bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500 text-white/40 hover:text-red-500 transition-all rounded-xl group"
          title="Delete Record"
        >
          <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};
