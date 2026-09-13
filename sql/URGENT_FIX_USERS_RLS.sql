-- ============================================
-- SOLUCIÓN COMPLETA PARA TABLA USERS
-- ============================================

-- 1. Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR políticas antiguas si existen
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- 3. CREAR políticas correctas

-- Permitir a usuarios autenticados VER su propio perfil
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Permitir a usuarios autenticados INSERTAR su propio perfil
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Permitir a usuarios autenticados ACTUALIZAR su propio perfil
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. VERIFICAR que se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. PROBAR consulta (esto debería funcionar después de aplicar las políticas)
SELECT id, username, email, avatar_url
FROM public.users
WHERE id = auth.uid();
