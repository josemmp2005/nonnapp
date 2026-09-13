import { z } from 'zod';

const PASSWORD_MIN = 6;

export const signupSchema = z.object({
  email: z.string().trim().min(1, 'email es obligatorio').email('Email inválido').max(255),
  password: z.string().min(PASSWORD_MIN, `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`).max(200),
  username: z.string().trim().min(1, 'El nombre de usuario es obligatorio').max(60),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'email es obligatorio').email('Email inválido').max(255),
  password: z.string().min(1, 'password es obligatorio').max(200),
});

export const updateUsernameSchema = z.object({
  username: z.string().trim().min(1, 'username es obligatorio').max(60),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(PASSWORD_MIN, `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`).max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'email es obligatorio').email('Email inválido').max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'token es obligatorio'),
  password: z.string().min(PASSWORD_MIN, `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`).max(200),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'token es obligatorio'),
});

// --- profile ---

export const preferencesSchema = z.object({
  allergies: z.string().max(1000).optional().default(''),
  disliked_ingredients: z.string().max(1000).optional().default(''),
  cooking_skill: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
});

// --- recipes ---

const recipeStepSchema = z.object({
  step_number: z.number().int().positive(),
  instruction: z.string().min(1).max(2000),
  visual_tag: z.string().max(200).nullable().optional(),
  visual_prompt: z.string().max(2000).nullable().optional(),
});

const recipeIngredientSchema = z.object({
  item: z.string().min(1).max(200),
  quantity: z.string().max(100).nullable().optional(),
});

export const saveRecipeSchema = z.object({
  recipe: z.object({
    recipe_metadata: z.object({
      title: z.string().min(1, 'recipe.recipe_metadata.title es obligatorio').max(200),
      description: z.string().max(4000).nullable().optional(),
      difficulty: z.string().max(50).nullable().optional(),
      cooking_time: z.string().max(100).nullable().optional(),
      servings: z.number().int().positive().max(100).nullable().optional(),
      calories: z.number().int().nonnegative().max(20000).nullable().optional(),
      macros: z
        .object({ protein: z.string().max(50), carbs: z.string().max(50), fat: z.string().max(50) })
        .nullable()
        .optional(),
    }),
    ingredients: z.array(recipeIngredientSchema).max(100).optional(),
    utensils: z.array(z.string().max(200)).max(100).optional(),
    steps: z.array(recipeStepSchema).max(100).optional(),
  }),
  prompt: z.string().max(2000).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

// --- ai ---

export const generateRecipeSchema = z.object({
  prompt: z.string().trim().min(1, 'prompt es obligatorio').max(1000),
  mode: z.enum(['text', 'pantry']).optional(),
  ingredients: z.string().max(1000).optional(),
  servings: z.number().int().positive().max(50).optional(),
  timeLimit: z.string().max(50).optional(),
  utensils: z.string().max(1000).optional(),
  userProfile: z
    .object({
      allergies: z.string().max(1000).optional(),
      disliked_ingredients: z.string().max(1000).optional(),
      cooking_skill: z.string().max(50).optional(),
    })
    .optional(),
});

export const generateImageSchema = z.object({
  prompt: z.string().trim().min(1, 'prompt es obligatorio').max(2000),
});

export const chatSchema = z.object({
  question: z.string().trim().min(1, 'question es obligatorio').max(1000),
  recipeContext: z
    .object({
      recipe_metadata: z.object({ title: z.string() }).passthrough(),
    })
    .passthrough(),
  history: z
    .array(z.object({ role: z.enum(['user', 'model']), text: z.string().max(2000) }))
    .max(50)
    .optional(),
});

// --- subscription ---

export const toggleSubscriptionSchema = z.object({
  currentStatus: z.boolean().optional(),
});
