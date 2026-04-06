import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    image: string;
    is_active: boolean;
    price: number;
    quota: number;
    created_at?: string;
}

export const eventService = {
    // get all events (untuk admin)
    getAll: async () => {
        const response = await api.get('/api/admin/events');
        return response.data.data;
    },

    // create event baru
    create: async (formData: FormData) => {
        const response = await api.post('/api/admin/events', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // update
    update: async (id: number, formData: FormData) => {
        const response = await api.put(`/api/admin/events/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // delete
    delete: async (id: number) => {
        const response = await api.delete(`/api/admin/events/${id}`);
        return response.data;
    }
};