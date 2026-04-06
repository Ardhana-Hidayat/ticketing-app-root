import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { eventService } from '@/services/api';

import { eventSchema, type EventFormValues } from '@/schemas/eventSchema';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({ // pakai satu generic aja
    resolver: zodResolver(eventSchema) as any, // "as any" ini jalan pintas biar TS gak rewel soal unknown
    defaultValues: {
      title: '',
      description: '',
      location: '',
      // date dibikin default ke string kosong atau waktu sekarang
      date: new Date().toISOString().slice(0, 16),
      // pastiin price & quota ada default-nya biar gak undefined
      price: 0,
      quota: 0,
    }
  });

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);

    const formData = new FormData();

    // 1. Masukkan data teks wajib
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('location', data.location);
    formData.append('date', new Date(data.date).toISOString());

    // 2. Masukkan Price & Quota (Konversi ke string agar FormData gak ngamuk)
    // Kita pakai string() biar kalau undefined dia gak dikirim atau dikirim string kosong
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.quota !== undefined) formData.append('quota', data.quota.toString());

    // 3. Masukkan file gambar
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    try {
      await eventService.create(formData);
      alert("Gokil! Event & Poster berhasil di-publish ke VPS! 🚀");
      navigate('/admin/events');
    } catch (error) {
      console.error("Error pas upload, ar:", error);
      alert("Waduh, gagal upload. Cek terminal Go kamu, mungkin folder 'uploads' belum dibuat!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Draft New Event</CardTitle>
          <CardDescription>Enter the primary details for your new event to publish it to the catalog.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Event Title</label>
            <Input placeholder="Enter a catchy title" {...register('title')} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Event Thumbnail</label>
            <Input
              type="file"
              accept="image/*"
              {...register('image')}
              className="cursor-pointer"
            />
            {errors.image && <p className="text-sm text-red-500">{String(errors.image.message)}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Description</label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe what people can expect..."
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Location Venue</label>
              <Input placeholder="e.g. Jakarta Convention Center" {...register('location')} />
              {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Date & Time</label>
              <Input type="datetime-local" className="text-muted-foreground" {...register('date')} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Price (IDR)</label>
              <Input type="number" placeholder="Leave empty if free" {...register('price')} />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Maximum Quota</label>
              <Input type="number" placeholder="Capacity" {...register('quota')} />
              {errors.quota && <p className="text-sm text-red-500">{errors.quota.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 border-t px-6 py-4">
          <Link to="/admin/events">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish Event'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateEvent;