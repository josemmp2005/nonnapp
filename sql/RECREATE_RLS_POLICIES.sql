-- =====================================================
-- PASO 4: RECREAR POLÍTICAS RLS CORRECTAMENTE
-- =====================================================
-- Solo ejecuta esto DESPUÉS de confirmar que sin RLS funciona

-- Primero, asegúrate de que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - Los usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Política para INSERT - Los usuarios pueden crear su propio perfil
CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Política para UPDATE - Los usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
-- =====================================================
SELECT 
    policyname,
    cmd,
    roles,
    qual::text as using_expression,
    with_check::text as with_check_expression
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;

-- =====================================================
-- PROBAR QUE FUNCIONA
-- =====================================================
-- Sustituye 'TU_USER_ID' con tu ID real (9577067a-03cd-43f5-a50a-587e1ed0d74b)
-- Esta consulta debería funcionar si las políticas están bien configuradas:

-- Ver tu perfil:
-- SELECT * FROM public.users WHERE id = '9577067a-03cd-43f5-a50a-587e1ed0d74b';

-- Actualizar tu perfil:
-- UPDATE public.users 
-- SET avatar_url = 'https://test.com/avatar.jpg'
-- WHERE id = '9577067a-03cd-43f5-a50a-587e1ed0d74b';
