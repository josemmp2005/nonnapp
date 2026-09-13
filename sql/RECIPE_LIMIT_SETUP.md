# Configuración de Límite de Recetas (RLS Policy)

## 📋 Descripción
Este script SQL implementa una validación en el **backend de Supabase** que impide que usuarios con plan **Nipote (Free)** generen más de 2 recetas por día.

## 🔒 Seguridad
- ✅ Imposible de saltarse desde el frontend
- ✅ Validación a nivel de base de datos (RLS)
- ✅ Los planes premium (La Mamma, La Nonna) no tienen límite

## 🚀 Cómo Aplicar

### Opción 1: Supabase Dashboard (Recomendado)
1. Ir a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navegar a **SQL Editor**
3. Copiar y pegar todo el contenido de `sql/recipe_limit_policy.sql`
4. Click en **Run** o presionar `Ctrl+Enter`

### Opción 2: CLI de Supabase
```bash
supabase db execute --file sql/recipe_limit_policy.sql
```

## ✅ Verificación
Para verificar que la política está activa:

```sql
-- Ver todas las políticas de la tabla recipes
SELECT * FROM pg_policies WHERE tablename = 'recipes';

-- Ver la función creada
SELECT * FROM pg_proc WHERE proname = 'check_daily_recipe_limit';
```

## 🧪 Pruebas
Para probar que funciona:

1. **Crear una suscripción Nipote para un usuario:**
   ```sql
   INSERT INTO subscriptions (user_id, plan_type, is_active)
   VALUES ('tu-user-uuid', 'nipote', true);
   ```

2. **Intentar crear 3 recetas el mismo día**
   - Las primeras 2 deberían guardarse correctamente
   - La tercera debería fallar con error RLS

3. **Verificar que usuarios premium no tienen límite:**
   ```sql
   UPDATE subscriptions 
   SET plan_type = 'la_mamma' 
   WHERE user_id = 'tu-user-uuid';
   ```
   - Ahora debería poder crear recetas ilimitadas

## 🔄 Comportamiento

### Plan Nipote (Free)
- ✅ Primeras 2 recetas del día: **Permitidas**
- ❌ Tercera receta: **Bloqueada con error**
- 🔄 Al día siguiente: **Contador se resetea automáticamente**

### Planes La Mamma / La Nonna
- ✅ Recetas ilimitadas
- ✅ Sin restricciones

## 🐛 Troubleshooting

**Error: "permission denied for table recipes"**
- Asegúrate de que RLS está habilitado en la tabla `recipes`
- Verifica que las políticas básicas de INSERT existen

**La política no se aplica**
- Verifica que la función `check_daily_recipe_limit` se creó correctamente
- Asegúrate de que la tabla `subscriptions` tiene datos

**Usuarios sin suscripción**
- Se asume automáticamente plan `nipote` (free)
- Aplica límite de 2 recetas/día

## 📝 Notas
- La política cuenta recetas desde las **00:00 hasta las 23:59** del día actual
- Usa la columna `created_at` de la tabla `recipes`
- Compatible con zonas horarias configuradas en Supabase
