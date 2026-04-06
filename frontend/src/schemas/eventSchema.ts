import * as z from 'zod';

// konstanta buat bantu validasi file, biar vps kamu nggak gampang penuh ar!
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const eventSchema = z.object({
  title: z.string()
    .min(5, "judul kegedean dikit dhan, minimal 5 karakter ya")
    .max(100, "wah kepanjangan ar, maksimal 100 karakter aja"),
  
  description: z.string()
    .min(10, "kasih deskripsi yang jelas biar orang nggak bingung"),
  
  location: z.string()
    .min(3, "lokasinya di mana nih?"),
  
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "format tanggalnya salah nih ar",
  }),

  // validasi buat upload gambar di vps
  image: z
    .any()
    .refine((files) => files?.length == 1, "poster event wajib di-upload ya ar!")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `maksimal ukuran foto 5MB ya dhan`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "format foto harus .jpg, .jpeg, .png atau .webp"
    ),

  // optional fields
  price: z.preprocess((val) => Number(val), z.number().min(0)),
  quota: z.preprocess((val) => Number(val), z.number().min(1)),
});

export type EventFormValues = z.infer<typeof eventSchema>;