import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Crown, CalendarDays, Plus, X, ShoppingCart, Loader2, Sparkles } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../context/ToastContext';
import { fetchWeekPlan, setPlanSlot, fetchWeeklyShoppingList } from '../services/planner';
import type { PlanItem, MealSlot } from '../services/planner';
import type { RecipeDB, IngredientItem } from '../types';
import RecipePickerModal from './RecipePickerModal';
import ShoppingListModal from './ShoppingListModal';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SLOTS: { key: MealSlot; label: string }[] = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'lunch', label: 'Comida' },
  { key: 'dinner', label: 'Cena' },
];

const slotKey = (day: number, slot: MealSlot) => `${day}-${slot}`;

// Función terminada pero todavía en pulido visual — bloqueada a propósito
// hasta que se anuncie. El backend tiene su propio PLANNER_ENABLED en
// server/src/routes/planner.ts, hay que cambiar los dos.
const PLANNER_ENABLED = false;

const ComingSoonScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="relative rounded-3xl bg-gradient-to-br from-[#18130D] to-[#0D0A06] overflow-hidden p-12 text-center">
        <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles aria-hidden="true" className="w-3.5 h-3.5" /> {t('app.planner.comingSoonBadge')}
          </span>

          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg mx-auto">
            <CalendarDays aria-hidden="true" className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white">{t('app.planner.title')}</h1>

          <p className="text-lg text-[#C3B89F] leading-relaxed">
            {t('app.planner.comingSoonText')}
          </p>

          <button
            onClick={() => navigate('/app')}
            className="px-8 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition active:scale-95 shadow-lg shadow-orange-500/20"
          >
            {t('app.chefPage.backToDashboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

const PlannerPage: React.FC = () => {
  const { limits } = useSubscription();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Record<string, PlanItem['recipe']>>({});
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<{ day: number; slot: MealSlot } | null>(null);
  const [shoppingList, setShoppingList] = useState<IngredientItem[] | null>(null);
  const [isLoadingShoppingList, setIsLoadingShoppingList] = useState(false);

  useEffect(() => {
    if (!PLANNER_ENABLED || !limits.hasWeeklyPlanner) return;
    (async () => {
      try {
        const items = await fetchWeekPlan();
        const map: Record<string, PlanItem['recipe']> = {};
        for (const item of items) map[slotKey(item.day, item.slot)] = item.recipe;
        setPlan(map);
      } catch {
        showToast('No se pudo cargar tu planificador', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limits.hasWeeklyPlanner]);

  const handleAssign = async (recipe: RecipeDB) => {
    if (!editingSlot || recipe.id == null) return;
    const { day, slot } = editingSlot;
    setEditingSlot(null);
    try {
      await setPlanSlot(day, slot, recipe.id);
      setPlan((prev) => ({
        ...prev,
        [slotKey(day, slot)]: {
          id: recipe.id!,
          title: recipe.recipe_metadata?.title || 'Receta sin título',
          main_image_url: recipe.main_image_url || null,
          cooking_time: recipe.recipe_metadata?.cooking_time || 'N/A',
          difficulty: recipe.recipe_metadata?.difficulty || 'Media',
        },
      }));
    } catch {
      showToast('No se pudo asignar la receta', 'error');
    }
  };

  const handleRemove = async (day: number, slot: MealSlot) => {
    const key = slotKey(day, slot);
    const previous = plan[key];
    setPlan((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    try {
      await setPlanSlot(day, slot, null);
    } catch {
      showToast('No se pudo quitar la receta', 'error');
      if (previous) setPlan((prev) => ({ ...prev, [key]: previous }));
    }
  };

  const handleShoppingList = async () => {
    setIsLoadingShoppingList(true);
    try {
      const ingredients = await fetchWeeklyShoppingList();
      if (ingredients.length === 0) {
        showToast('Asigna alguna receta primero para generar la lista', 'info');
        return;
      }
      setShoppingList(ingredients);
    } catch {
      showToast('No se pudo generar la lista de la compra', 'error');
    } finally {
      setIsLoadingShoppingList(false);
    }
  };

  if (!PLANNER_ENABLED) {
    return <ComingSoonScreen />;
  }

  if (!limits.hasWeeklyPlanner) {
    return (
      <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
        <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 overflow-hidden p-12 text-center">
          <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <Lock aria-hidden="true" className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#241B10] dark:text-[#F8F2E6] mb-4">
              Planificador Semanal
            </h1>

            <p className="text-xl text-[#3A2E1D] dark:text-[#D4D4D8] leading-relaxed mb-8">
              Organiza el desayuno, la comida y la cena de toda la semana con tus recetas guardadas, y genera la lista de la compra combinada. Disponible en el plan <span className="font-bold text-primary">La Nonna</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/app/preferences')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Crown aria-hidden="true" className="w-5 h-5" />
                Actualizar Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#241B10] dark:text-[#F8F2E6] flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="w-7 h-7 text-primary" />
            Planificador Semanal
          </h1>
          <p className="text-[#6B5D48] dark:text-[#9A8D74] mt-1">Asigna tus recetas guardadas a cada día de la semana.</p>
        </div>
        <button
          onClick={handleShoppingList}
          disabled={isLoadingShoppingList}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-60"
        >
          {isLoadingShoppingList ? (
            <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" />
          ) : (
            <ShoppingCart aria-hidden="true" className="w-5 h-5" />
          )}
          Lista de la compra semanal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 aria-hidden="true" className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {DAYS.map((dayName, day) => (
            <div key={dayName} className="space-y-2">
              <h3 className="text-sm font-bold text-[#241B10] dark:text-[#F8F2E6] uppercase tracking-wide px-1">
                {dayName}
              </h3>
              {SLOTS.map(({ key: slot, label }) => {
                const recipe = plan[slotKey(day, slot)];
                return (
                  <div
                    key={slot}
                    className="bg-white dark:bg-[#18130D] rounded-xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm p-2.5 min-h-[76px] flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-bold text-[#6B5D48] dark:text-[#9A8D74] uppercase tracking-wider">
                      {label}
                    </span>
                    {recipe ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {recipe.main_image_url && (
                            <img src={recipe.main_image_url} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-[#241B10] dark:text-[#F8F2E6] line-clamp-2 flex-grow">
                          {recipe.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemove(day, slot)}
                          aria-label={`Quitar ${recipe.title} de ${label} del ${dayName}`}
                          className="flex-shrink-0 text-[#6B5D48] dark:text-[#9A8D74] hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingSlot({ day, slot })}
                        className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Plus aria-hidden="true" className="w-3.5 h-3.5" /> Añadir receta
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {editingSlot && <RecipePickerModal onSelect={handleAssign} onClose={() => setEditingSlot(null)} />}

      {shoppingList && (
        <ShoppingListModal
          ingredients={shoppingList}
          title="Lista de la semana"
          onClose={() => setShoppingList(null)}
        />
      )}
    </div>
  );
};

export default PlannerPage;
