import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Image as ImageIcon } from 'lucide-react'; // Tambah ImageIcon buat fallback
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { eventService, type Event } from '@/services/api';

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil URL dasar dari env untuk nampilin gambar dari VPS
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAll();
        setEvents(data);
      } catch (error) {
        console.error("wah, gagal narik data festival nih dhan!", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("yakin mau hapus event ini dhan? gambarnya juga bakal ilang loh!")) {
      try {
        await eventService.delete(id);
        setEvents(events.filter(e => e.id !== id));
        alert("event terhapus! 🗑️");
      } catch (error) {
        alert("gagal hapus!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events Catalog</h2>
          <p className="text-muted-foreground mt-1">Manage all your upcoming and past events.</p>
        </div>
        <Link to="/admin/events/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </Link>
      </div>

      <Card className='rounded-sm'>
        <CardHeader className="pb-0" />
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-salmon" />
              <p className="text-sm font-bold uppercase animate-pulse">Memuat data event...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[100px]">Thumbnail</TableHead>
                  <TableHead>Event Title</TableHead>
                  <TableHead className="w-[150px]">Date & Time</TableHead>
                  <TableHead className="w-[150px]">Location</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[160px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {events.length > 0 ? (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        #{event.id}
                      </TableCell>

                      <TableCell>
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-input">
                          {event.image ? (
                            <img
                              src={`${API_URL}/uploads/${event.image}`}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Error';
                              }}
                            />
                          ) : (
                            <ImageIcon className="text-muted-foreground w-5 h-5" />
                          )}
                        </div>
                      </TableCell>

                      {/* Judul: pake line-clamp-1 biar kalau kepanjangan gak ngerusak tinggi baris */}
                      <TableCell className="font-semibold max-w-[200px] truncate">
                        {event.title}
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(event.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm truncate max-w-[150px]">
                        {event.location}
                      </TableCell>

                      <TableCell>
                        <Badge variant={event.is_active ? "secondary" : "destructive"}>
                          {event.is_active ? "Active" : "Draft"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm">
                          <Link to={`/admin/events/edit/${event.id}`}>Edit</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    {/* colSpan harus 7 karena kita sekarang punya 7 kolom total (termasuk ID) */}
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Belum ada event, nih. Ayo buat event pertama!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsList;