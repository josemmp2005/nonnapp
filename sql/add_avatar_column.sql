-- Verificar si la columna avatar_url existe en la tabla users
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Ver la estructura actual de la tabla users
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users';

-- 2. Si avatar_url NO aparece en el resultado, añádela con este comando:
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Verificar que se añadió correctamente
SELECT id, username, email, avatar_url
FROM public.users
LIMIT 5;
