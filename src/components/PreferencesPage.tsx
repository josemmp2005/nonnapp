import React from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import type { UserProfile } from '../types';
import { saveChefPreferences } from '../services/data';
import { useToast } from '../context/ToastContext';
import { useSubscription } from '../context/SubscriptionContext';
import PlanCheckoutModal from './PlanCheckoutModal';
import PlanChangeDisabledNotice from './preferences/PlanChangeDisabledNotice';
import SubscriptionCard from './preferences/SubscriptionCard';
import SkillLevelSection from './preferences/SkillLevelSection';
import AllergiesSection from './preferences/AllergiesSection';
import DislikedIngredientsSection from './preferences/DislikedIngredientsSection';
import UtensilsSection from './preferences/UtensilsSection';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  session: any;
}

// Pasarela de pago real aún no implementada — bloqueado temporalmente para
// el primer despliegue público (nadie debe poder autoconcederse un plan de
// pago sin pagar). Cambiar a true (y el mismo flag en
// server/src/routes/subscription.ts) para reactivar el cambio de plan.
const PLAN_CHANGES_ENABLED = false;

const PreferencesPage: React.FC<Props> = ({ profile, setProfile, session }) => {
  const { showToast } = useToast();
  const { limits, subscription, refreshSubscription } = useSubscription();
  const isChefPreferencesLocked = !limits.hasChefPreferences;
  // Única fuente de verdad para "¿es pro?": el plan que devuelve el servidor
  // (SubscriptionContext), no `profile.is_pro` — ese campo (marcado deprecated
  // en types.ts) se actualizaba de forma optimista sin refrescar `limits`,
  // así que justo después de darse de alta esta tarjeta decía "Pro" mientras
  // las secciones de abajo (que sí leen `limits`) seguían bloqueadas.
  const isCurrentlyPro = subscription.plan_type !== 'Nipote';
  const [saved, setSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);

    try {
      const { error } = await saveChefPreferences(profile);

      if (error) {
        throw error;
      }

      setSaved(true);
      showToast('Preferencias guardadas correctamente', 'success');
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      showToast('No se pudieron guardar los cambios. Intenta de nuevo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // El modal (PlanCheckoutModal) hace la llamada real a changeSubscription y
  // la "simulación de pago" — aquí solo hay que refrescar `limits`/`subscription`
  // para que toda la página (incluidos los candados de abajo) quede al día.
  const handlePlanChanged = async () => {
    await refreshSubscription();
    setIsPlanModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#241B10] dark:text-[#F8F2E6]">Configuración del Chef</h1>
        <p className="text-[#8C7C63] dark:text-[#7C715E] mt-2">Personaliza cómo la IA genera tus recetas.</p>
      </div>

      <div className="space-y-6">
        <SubscriptionCard
          subscription={subscription}
          isCurrentlyPro={isCurrentlyPro}
          onOpenPlanModal={() => setIsPlanModalOpen(true)}
        />

        {isPlanModalOpen && (
          PLAN_CHANGES_ENABLED ? (
            <PlanCheckoutModal
              currentPlan={subscription.plan_type}
              onClose={() => setIsPlanModalOpen(false)}
              onChanged={handlePlanChanged}
            />
          ) : (
            <PlanChangeDisabledNotice onClose={() => setIsPlanModalOpen(false)} />
          )
        )}

        <SkillLevelSection
          value={profile.cooking_skill}
          onChange={(level) => setProfile({ ...profile, cooking_skill: level })}
        />

        <AllergiesSection
          useAllergies={profile.use_allergies || false}
          allergies={profile.allergies}
          onUseAllergiesChange={(val) => setProfile({ ...profile, use_allergies: val })}
          onAllergiesChange={(val) => setProfile({ ...profile, allergies: val })}
          locked={isChefPreferencesLocked}
        />

        <DislikedIngredientsSection
          value={profile.disliked_ingredients}
          onChange={(val) => setProfile({ ...profile, disliked_ingredients: val })}
          locked={isChefPreferencesLocked}
        />

        <UtensilsSection
          useUtensils={profile.use_utensils || false}
          availableUtensils={profile.available_utensils || ''}
          onUseUtensilsChange={(val) => setProfile({ ...profile, use_utensils: val })}
          onAvailableUtensilsChange={(val) => setProfile({ ...profile, available_utensils: val })}
          locked={isChefPreferencesLocked}
        />

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 shadow-lg ${saved ? 'bg-green-500' : 'bg-primary hover:bg-orange-600 shadow-orange-200 dark:shadow-none'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                Guardado
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
