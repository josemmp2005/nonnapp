/**
 * Página `/app/recipes/new`: formulario para añadir una receta propia al
 * recetario (título, ingredientes y pasos obligatorios; el resto opcional),
 * sin pasar por la IA.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, Loader2, Save, Lock, Crown, Tag as TagIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { TagEditor } from './ui/TagEditor';
import { useToast } from '../context/ToastContext';
import { useSubscription } from '../context/SubscriptionContext';
import { saveManualRecipeToDB, setRecipeTags, fetchUserTags, OwnRecipesPlanRequiredError, OwnRecipeLimitError } from '../services/data';

interface IngredientRow {
  key: number;
  item: string;
  quantity: string;
}

interface StepRow {
  key: number;
  instruction: string;
}

// Claves estables para las filas dinámicas: usar el índice como key rompe el
// foco/orden al borrar una fila del medio, así que cada fila lleva un id
// propio que no cambia mientras exista.
let nextRowKey = 0;
const newIngredientRow = (): IngredientRow => ({ key: nextRowKey++, item: '', quantity: '' });
const newStepRow = (): StepRow => ({ key: nextRowKey++, instruction: '' });

const AddRecipePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { limits } = useSubscription();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Media');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState(2);
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([newIngredientRow()]);
  const [utensils, setUtensils] = useState<string[]>(['']);
  const [steps, setSteps] = useState<StepRow[]>([newStepRow()]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserTags().then(setTagSuggestions).catch(() => {});
  }, []);

  const updateIngredient = (key: number, field: 'item' | 'quantity', value: string) =>
    setIngredients((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const updateStep = (key: number, value: string) =>
    setSteps((rows) => rows.map((r) => (r.key === key ? { ...r, instruction: value } : r)));
  const updateUtensil = (index: number, value: string) =>
    setUtensils((rows) => rows.map((r, i) => (i === index ? value : r)));

  const hasIngredient = ingredients.some((r) => r.item.trim());
  const hasStep = steps.some((r) => r.instruction.trim());
  const canSubmit = title.trim() && hasIngredient && hasStep && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    try {
      const cleanIngredients = ingredients.filter((r) => r.item.trim()).map((r) => ({ item: r.item.trim(), quantity: r.quantity.trim() }));
      const cleanSteps = steps
        .filter((r) => r.instruction.trim())
        .map((r, i) => ({ step_number: i + 1, instruction: r.instruction.trim(), visual_tag: '' }));
      const cleanUtensils = utensils.map((u) => u.trim()).filter(Boolean);

      const saved = await saveManualRecipeToDB(
        {
          recipe_metadata: {
            title: title.trim(),
            description: description.trim(),
            difficulty,
            cooking_time: cookingTime.trim() || 'N/A',
            servings,
            calories: 0,
            macros: { protein: '0g', carbs: '0g', fat: '0g' },
          },
          ingredients: cleanIngredients,
          utensils: cleanUtensils,
          steps: cleanSteps,
        },
        imageUrl.trim() || null
      );

      if (tags.length > 0 && saved.id != null) {
        // La receta ya se ha guardado bien; si fallan las etiquetas no se
        // deshace nada, solo se avisa — se pueden añadir después desde el detalle.
        await setRecipeTags(saved.id, tags).catch(() => showToast(t('app.recipeDetail.tagsError'), 'error'));
      }

      showToast(t('app.addRecipePage.toastSaved'), 'success');
      navigate(`/app/recipe/${saved.id}`);
    } catch (err) {
      if (err instanceof OwnRecipesPlanRequiredError) {
        showToast(t('app.addRecipePage.toastPlanRequired'), 'error');
        navigate('/app/history');
      } else if (err instanceof OwnRecipeLimitError) {
        showToast(t('app.addRecipePage.toastLimitReached', { limit: err.limit }), 'error');
        navigate('/app/history');
      } else {
        showToast(t('app.addRecipePage.toastError'), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Red de seguridad además del servidor: si Il Nipote llega aquí directamente
  // por la URL (el botón ya no se le enseña), no ve el formulario.
  if (limits.maxOwnRecipes === 0) {
    return (
      <div className="max-w-2xl mx-auto pb-20 animate-in fade-in duration-500 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Lock aria-hidden="true" className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-ink dark:text-ink-light flex items-center justify-center gap-2">
          <Crown aria-hidden="true" className="w-5 h-5 text-amber-500" />
          {t('app.historyPage.ownLockedTitle')}
        </h1>
        <p className="text-muted dark:text-muted-dark mt-2 mb-6 max-w-md mx-auto">{t('app.historyPage.ownLockedSubtitle')}</p>
        <button
          onClick={() => navigate('/app/profile')}
          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition active:scale-95"
        >
          {t('app.historyPage.viewPlans')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate('/app/history')}
        className="flex items-center gap-2 text-muted hover:text-ink dark:hover:text-white mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('app.addRecipePage.back')}
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink dark:text-ink-light">{t('app.addRecipePage.title')}</h1>
        <p className="text-muted dark:text-muted-dark mt-1">{t('app.addRecipePage.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <label htmlFor="recipe-title" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
              {t('app.addRecipePage.titleLabel')}
            </label>
            <Input id="recipe-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
          </div>

          <div>
            <label htmlFor="recipe-description" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
              {t('app.addRecipePage.descriptionLabel')}
            </label>
            <textarea
              id="recipe-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
              rows={3}
              className="w-full py-3 px-4 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl outline-none transition text-ink dark:text-ink-light focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="recipe-difficulty" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
                {t('app.addRecipePage.difficultyLabel')}
              </label>
              <select
                id="recipe-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full py-3 px-3 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl outline-none transition text-ink dark:text-ink-light focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Fácil">{t('app.historyPage.difficultyEasy')}</option>
                <option value="Media">{t('app.historyPage.difficultyMedium')}</option>
                <option value="Difícil">{t('app.historyPage.difficultyHard')}</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="recipe-time" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
                {t('app.addRecipePage.timeLabel')}
              </label>
              <Input id="recipe-time" value={cookingTime} onChange={(e) => setCookingTime(e.target.value)} placeholder={t('app.addRecipePage.timePlaceholder')} maxLength={100} />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="recipe-servings" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
                {t('app.addRecipePage.servingsLabel')}
              </label>
              <Input
                id="recipe-servings"
                type="number"
                min={1}
                max={100}
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="recipe-image" className="block text-sm font-medium text-ink dark:text-ink-light mb-1.5">
                {t('app.addRecipePage.imageLabel')}
              </label>
              <Input id="recipe-image" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder={t('app.addRecipePage.imagePlaceholder')} />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink dark:text-ink-light mb-1.5">
              <TagIcon aria-hidden="true" className="w-4 h-4" /> {t('app.addRecipePage.tagsLabel')}
            </label>
            <TagEditor tags={tags} onChange={setTags} suggestions={tagSuggestions} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink dark:text-ink-light mb-4">{t('app.addRecipePage.ingredientsHeading')}</h2>
          <div className="space-y-3">
            {ingredients.map((row) => (
              <div key={row.key} className="flex gap-2">
                <Input
                  aria-label={t('app.addRecipePage.ingredientNameAria')}
                  placeholder={t('app.addRecipePage.ingredientNamePlaceholder')}
                  value={row.item}
                  onChange={(e) => updateIngredient(row.key, 'item', e.target.value)}
                  className="flex-grow"
                  maxLength={200}
                />
                <Input
                  aria-label={t('app.addRecipePage.ingredientQuantityAria')}
                  placeholder={t('app.addRecipePage.ingredientQuantityPlaceholder')}
                  value={row.quantity}
                  onChange={(e) => updateIngredient(row.key, 'quantity', e.target.value)}
                  className="w-32 flex-shrink-0"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setIngredients((rows) => rows.filter((r) => r.key !== row.key))}
                  disabled={ingredients.length === 1}
                  aria-label={t('app.addRecipePage.removeRowAria')}
                  className="flex-shrink-0 p-3 rounded-xl text-muted dark:text-muted-dark hover:text-error hover:bg-error/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIngredients((rows) => [...rows, newIngredientRow()])} className="mt-3">
            <Plus className="w-4 h-4" /> {t('app.addRecipePage.addIngredient')}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink dark:text-ink-light mb-4">{t('app.addRecipePage.utensilsHeading')}</h2>
          <div className="space-y-3">
            {utensils.map((value, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  aria-label={t('app.addRecipePage.utensilAria')}
                  placeholder={t('app.addRecipePage.utensilPlaceholder')}
                  value={value}
                  onChange={(e) => updateUtensil(i, e.target.value)}
                  className="flex-grow"
                  maxLength={200}
                />
                <button
                  type="button"
                  onClick={() => setUtensils((rows) => rows.filter((_, j) => j !== i))}
                  disabled={utensils.length === 1}
                  aria-label={t('app.addRecipePage.removeRowAria')}
                  className="flex-shrink-0 p-3 rounded-xl text-muted dark:text-muted-dark hover:text-error hover:bg-error/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setUtensils((rows) => [...rows, ''])} className="mt-3">
            <Plus className="w-4 h-4" /> {t('app.addRecipePage.addUtensil')}
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink dark:text-ink-light mb-4">{t('app.addRecipePage.stepsHeading')}</h2>
          <div className="space-y-3">
            {steps.map((row, i) => (
              <div key={row.key} className="flex gap-2 items-start">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <textarea
                  aria-label={t('app.addRecipePage.stepAria', { number: i + 1 })}
                  placeholder={t('app.addRecipePage.stepPlaceholder')}
                  value={row.instruction}
                  onChange={(e) => updateStep(row.key, e.target.value)}
                  maxLength={2000}
                  rows={2}
                  className="flex-grow py-3 px-4 bg-cream dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 rounded-xl outline-none transition text-ink dark:text-ink-light focus:bg-white dark:focus:bg-[#2A2114] focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
                <button
                  type="button"
                  onClick={() => setSteps((rows) => rows.filter((r) => r.key !== row.key))}
                  disabled={steps.length === 1}
                  aria-label={t('app.addRecipePage.removeRowAria')}
                  className="flex-shrink-0 p-3 rounded-xl text-muted dark:text-muted-dark hover:text-error hover:bg-error/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setSteps((rows) => [...rows, newStepRow()])} className="mt-3">
            <Plus className="w-4 h-4" /> {t('app.addRecipePage.addStep')}
          </Button>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/app/history')}>
            {t('app.addRecipePage.cancel')}
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t('app.addRecipePage.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRecipePage;
