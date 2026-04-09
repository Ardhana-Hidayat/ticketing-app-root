import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Loader2 } from 'lucide-react';
import { adminApi } from '@/services/api';
import type { Event } from '@/types';
import { formatImageURL } from '@/lib/utils';

const EventsList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res: any = await adminApi.getAllEvents();
      const eventData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setEvents(eventData);
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this event? This action cannot be undone.')) {
      adminApi.deleteEvent(id)
        .then(() => fetchEvents())
        .catch((err: any) => alert('Failed to delete: ' + err.message));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Events Management</h2>
          <p className="text-slate-500 text-sm">Monitor and manage your event catalog from a single hub.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/events/create')} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center gap-2 w-fit"
        >
          <Plus size={20} /> Add New Event
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10 mb-4" />
            <p className="text-slate-400 font-medium">Synchronizing records...</p>
          </div>
        ) : !Array.isArray(events) || events.length === 0 ? (
          <div className="p-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
             <Calendar className="w-16 h-16 mx-auto mb-6 text-slate-200" />
             <p className="text-xl font-bold text-slate-900">No events detected.</p>
             <p className="text-slate-500 mt-2">Initialize your first event node to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-md transition-all">
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                      <img 
                        src={formatImageURL(event.banner_url) || "https://picsum.photos/seed/event/200/200"} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#EVT-{event.id}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                          event.publish_status === 'published' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {event.publish_status}
                        </span>
                     </div>
                     <h3 className="text-lg font-bold text-slate-900 truncate">{event.title}</h3>
                     <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-500">
                           <Calendar size={14} />
                           <span className="text-xs font-medium">{new Date(event.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                           <MapPin size={14} />
                           <span className="text-xs font-medium truncate max-w-[150px]">{event.location}</span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   <button 
                     onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                     className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
                   >
                     Manage
                   </button>
                   <button 
                     onClick={() => handleDelete(event.id)}
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

export default EventsList;
