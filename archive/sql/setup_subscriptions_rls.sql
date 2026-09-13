-- Configurar RLS para la tabla subscriptions
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON subscriptions;

-- 2. Crear política para SELECT (ver sus propias suscripciones)
CREATE POLICY "Users can view their own subscriptions"
ON subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Crear política para INSERT (crear sus propias suscripciones)
CREATE POLICY "Users can insert their own subscriptions"
ON subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Crear política para UPDATE (actualizar sus propias suscripciones)
CREATE POLICY "Users can update their own subscriptions"
ON subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 

-- 5. Crear política para DELETE (eliminar sus propias suscripciones)
CREATE POLICY "Users can delete their own subscriptions"
ON subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Política adicional para service_role (admin access)
CREATE POLICY "Service role can manage all subscriptions"
ON subscriptions
FOR ALL
USING (auth.role() = 'service_role');

-- 7. Verificar que RLS esté habilitado
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 8. Verificar las políticas creadas
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
WHERE tablename = 'subscriptions';
