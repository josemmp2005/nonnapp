-- Crear suscripción automática para nuevos usuarios
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Crear función que crea la suscripción
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar suscripción Nipote (Free) para el nuevo usuario
  INSERT INTO public.subscriptions (user_id, plan_type, is_active, start_date)
  VALUES (NEW.id, 'Nipote', true, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear trigger que ejecuta la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar que el trigger se creó correctamente
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. (Opcional) Crear suscripciones para usuarios existentes que no tengan ninguna
INSERT INTO public.subscriptions (user_id, plan_type, is_active, start_date)
SELECT 
    id,
    'Nipote'::public.subscription,
    true,
    NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT DO NOTHING;

-- 5. Verificar suscripciones creadas
SELECT 
    u.email,
    s.plan_type,
    s.is_active,
    s.start_date
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC
LIMIT 10;
