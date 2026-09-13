-- Sabora — esquema canónico para Postgres local.
-- Sustituye a los parches sueltos de ../sql/*.sql (pensados para el dashboard
-- de Supabase, con auth.users/auth.uid()). Aquí la autorización vive en el
-- backend (server/src/middleware/auth.ts + routes/*), no en RLS.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  -- NULL para cuentas que solo entran con Google (nunca fijaron contraseña).
  password_hash TEXT,
  username TEXT NOT NULL,
  avatar_url TEXT,
  google_id TEXT UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Por si la tabla ya existía de antes de añadir estas columnas (CREATE TABLE
-- IF NOT EXISTS no las habría añadido a una tabla preexistente).
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Sesiones server-side: el JWT de la cookie lleva el id de la fila (sid) además
-- del user id. Permite revocar una sesión concreta (logout) o todas las de un
-- usuario (cambio de contraseña / reset) sin esperar a que el JWT expire solo.
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Un único enum de plan_type. El código legado mezclaba 'nipote'/'Nipote'/'chef';
-- aquí se fija a minúsculas y coincide con lo que usa SubscriptionContext.tsx.
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('nipote', 'mamma', 'nonna')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON subscriptions(user_id, is_active);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  allergies TEXT DEFAULT '',
  disliked_ingredients TEXT DEFAULT '',
  hability TEXT DEFAULT 'intermediate',
  available_utensils TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  cooking_time TEXT,
  servings INTEGER,
  calories INTEGER,
  macros JSONB,
  main_image_url TEXT,
  generation_prompt TEXT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  source_origin TEXT DEFAULT 'IA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_id + created_at cubre: "mis recetas recientes" y el conteo del límite diario.
CREATE INDEX IF NOT EXISTS idx_recipes_user_created ON recipes(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS recipe_steps (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  visual_tag TEXT,
  visual_prompt TEXT
);

CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON recipe_steps(recipe_id);

CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity TEXT,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS utensils (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_utensils (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  utensil_id INTEGER NOT NULL REFERENCES utensils(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, utensil_id)
);

-- Suscripción "nipote" (free) automática al registrarse. Se hace en el
-- backend (routes/auth.ts) dentro de la misma transacción del signup,
-- no como trigger silencioso — así un fallo real se ve en el signup en vez
-- de tragarse (como pasaba con el EXCEPTION WHEN OTHERS de handle_new_user).
