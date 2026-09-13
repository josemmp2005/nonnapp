-- Verificar y configurar políticas RLS para la tabla users
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- 2. Habilitar RLS si no está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para permitir que usuarios actualicen su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Crear política para permitir INSERT (upsert necesita INSERT también)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. Crear política para permitir SELECT (lectura)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 6. Verificar que se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'users';
