-- ============================================
-- CREATE STORAGE BUCKET FOR BARBER IMAGES
-- ============================================

-- Create storage bucket for barber images
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-images', 'barber-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to barber images
CREATE POLICY "Public read access for barber images"
ON storage.objects FOR SELECT
USING (bucket_id = 'barber-images');

-- Allow authenticated users to upload barber images
CREATE POLICY "Authenticated users can upload barber images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'barber-images' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to update barber images
CREATE POLICY "Admins can update barber images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'barber-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete barber images
CREATE POLICY "Admins can delete barber images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'barber-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
