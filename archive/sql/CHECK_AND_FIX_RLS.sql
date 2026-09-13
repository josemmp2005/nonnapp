-- =====================================================
-- PASO 1: VERIFICAR POLÍTICAS ACTUALES
-- =====================================================
-- Ejecuta esta consulta para ver qué políticas existen
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- =====================================================
-- PASO 2: LIMPIAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================
-- Elimina TODAS las políticas existentes en la tabla users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;

-- =====================================================
-- PASO 3: DESHABILITAR RLS TEMPORALMENTE PARA PRUEBAS
-- =====================================================
-- IMPORTANTE: Esto es solo para confirmar que RLS es el problema
-- NO DEJAR EN PRODUCCIÓN
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Ejecuta PASO 1 para ver las políticas actuales
-- 2. Ejecuta PASO 2 para eliminar todas las políticas
-- 3. Ejecuta PASO 3 para deshabilitar RLS temporalmente
-- 4. Ve a la app y prueba subir un avatar
-- 5. Si funciona, vuelve aquí y ejecuta PASO 4 (siguiente archivo)
-- =====================================================

-- Para volver a habilitar RLS más tarde (NO EJECUTAR AHORA):
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
