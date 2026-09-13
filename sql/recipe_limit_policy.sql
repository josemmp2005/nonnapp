-- =====================================================
-- POLÍTICA RLS: LÍMITE DE RECETAS DIARIAS PARA PLAN NIPOTE
-- =====================================================
-- Esta política valida en el servidor que los usuarios con plan Nipote
-- no puedan crear más de 2 recetas por día.
-- Los planes La Mamma y La Nonna tienen recetas ilimitadas.

-- Primero, eliminar política existente si existe
DROP POLICY IF EXISTS "recipe_daily_limit_nipote" ON public.recipes;

-- Crear función helper para contar recetas del día
CREATE OR REPLACE FUNCTION check_daily_recipe_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    recipes_today INTEGER;
BEGIN
    -- Obtener el plan del usuario
    SELECT s.plan_type INTO user_plan
    FROM public.subscriptions s
    WHERE s.user_id = user_uuid
      AND s.is_active = true
      AND (s.end_date IS NULL OR s.end_date > NOW())
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- Si no tiene suscripción activa, se asume plan 'nipote' (free)
    IF user_plan IS NULL THEN
        user_plan := 'nipote';
    END IF;

    -- Si el plan es La Mamma o La Nonna, permitir sin límite
    IF user_plan IN ('la_mamma', 'la_nonna') THEN
        RETURN TRUE;
    END IF;

    -- Para plan Nipote, contar recetas de hoy
    SELECT COUNT(*) INTO recipes_today
    FROM public.recipes
    WHERE user_id = user_uuid
      AND created_at >= CURRENT_DATE
      AND created_at < CURRENT_DATE + INTERVAL '1 day';

    -- Permitir si tiene menos de 2 recetas hoy
    RETURN recipes_today < 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear política que use la función
CREATE POLICY "recipe_daily_limit_nipote"
ON public.recipes
FOR INSERT
TO authenticated
WITH CHECK (
    check_daily_recipe_limit(auth.uid())
);

-- Comentario para documentación
COMMENT ON POLICY "recipe_daily_limit_nipote" ON public.recipes IS 
'Limita a los usuarios con plan Nipote (free) a crear máximo 2 recetas por día. Los planes premium tienen recetas ilimitadas.';
