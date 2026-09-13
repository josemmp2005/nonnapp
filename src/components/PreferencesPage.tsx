import React from 'react';
import { Settings, AlertCircle, UtensilsCrossed, Save, Check, Loader2, Ban, Crown, CreditCard } from 'lucide-react';
import type { UserProfile } from '../types';
import { saveChefPreferences, toggleSubscription } from '../services/data';
import { useToast } from '../context/ToastContext';

interface Props {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  session: any;
}

const PreferencesPage: React.FC<Props> = ({ profile, setProfile, session }) => {
  const { showToast } = useToast();
  const [saved, setSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubscribing, setIsSubscribing] = React.useState(false);

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
      console.error("Error saving preferences:", err);
      showToast("No se pudieron guardar los cambios. Intenta de nuevo.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubscriptionToggle = async () => {
    if (!session?.user?.id) return;
    setIsSubscribing(true);
    
    const isCurrentlyPro = profile.is_pro || false;
    
    try {
        const { error } = await toggleSubscription(isCurrentlyPro);
        
        if (error) throw error;

        // Optimistically update UI
        setProfile({ ...profile, is_pro: !isCurrentlyPro });
        
        if (!isCurrentlyPro) {
            showToast("¡Bienvenido al plan Chef! Disfruta de imágenes paso a paso.", 'success');
        } else {
            showToast("Tu suscripción ha sido cancelada.", 'info');
        }

    } catch (err: any) {
        console.error(err);
        showToast("Error actualizando la suscripción.", 'error');
    } finally {
        setIsSubscribing(false);
    }
  };

  const Toggle = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <h4 className="text-sm font-medium text-[#241B10] dark:text-[#F8F2E6]">{label}</h4>
        {description && <p className="text-xs text-[#8C7C63] dark:text-[#7C715E] mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-[#241B10]/15 dark:bg-[#2A2114]'}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#241B10] dark:text-[#F8F2E6]">Configuración del Chef</h1>
        <p className="text-[#8C7C63] dark:text-[#7C715E] mt-2">Personaliza cómo la IA genera tus recetas.</p>
      </div>

      <div className="space-y-6">
        
        {/* Subscription Management (Linked to DB) */}
        <section className="bg-gradient-to-r from-[#241B10] to-[#18130D] dark:from-[#18130D] dark:to-[#0D0A06] p-6 rounded-2xl border border-white/10 shadow-lg text-white transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">Tu Plan Actual</h2>
                <p className="text-xs text-[#C3B89F]">Gestiona tu suscripción nonnapp Pro.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between py-2 gap-4">
             <div className="pr-4 w-full">
                <div className="flex items-baseline gap-2">
                    <h4 className="text-xl font-bold text-white">
                        {profile.is_pro ? "Plan Chef (Pro)" : "Plan Gratuito"}
                    </h4>
                    {profile.is_pro && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">ACTIVO</span>}
                </div>
                <p className="text-sm text-[#C3B89F] mt-2">
                    {profile.is_pro
                        ? "Tienes acceso a generación de imágenes paso a paso, historial ilimitado y soporte prioritario."
                        : "Actualiza a Pro para generar imágenes de cada paso de tus recetas y eliminar límites."}
                </p>
             </div>

             <button
                onClick={handleSubscriptionToggle}
                disabled={isSubscribing}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 whitespace-nowrap min-w-[140px] justify-center
                    ${profile.is_pro
                        ? 'bg-white/10 hover:bg-white/20 text-[#D4D4D8] border border-white/10'
                        : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white shadow-orange-900/20'
                    }`}
             >
                {isSubscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : profile.is_pro ? (
                    "Cancelar Suscripción"
                ) : (
                    <>
                        <CreditCard className="w-4 h-4" />
                        Obtener Pro
                    </>
                )}
             </button>
          </div>
        </section>

        {/* Nivel de Cocina */}
        <section className="bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Habilidad Culinaria</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setProfile({ ...profile, cooking_skill: level as any })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  profile.cooking_skill === level 
                    ? 'border-primary bg-orange-50 dark:bg-orange-900/20 ring-1 ring-primary' 
                    : 'border-[#241B10]/10 dark:border-[#F5E6CD]/10 hover:border-[#241B10]/15 dark:hover:border-[#F5E6CD]/20'
                }`}
              >
                <div className="font-semibold text-[#241B10] dark:text-[#F8F2E6] capitalize">
                  {level === 'beginner' && 'Principiante'}
                  {level === 'intermediate' && 'Intermedio'}
                  {level === 'advanced' && 'Avanzado'}
                </div>
                <p className="text-xs text-[#8C7C63] dark:text-[#7C715E] mt-1">
                  {level === 'beginner' && 'Instrucciones detalladas y simples.'}
                  {level === 'intermediate' && 'Equilibrio entre detalle y libertad.'}
                  {level === 'advanced' && 'Técnicas complejas y menos guía.'}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Intolerancias */}
        <section className="bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-4 border-b border-[#241B10]/5 dark:border-[#F5E6CD]/10 pb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Restricciones Alimentarias</h2>
          </div>

          <Toggle 
            label="Activar Filtro de Alergias/Intolerancias" 
            description="La IA será estricta excluyendo ingredientes."
            checked={profile.use_allergies || false}
            onChange={(val) => setProfile({...profile, use_allergies: val})}
          />

          {profile.use_allergies && (
            <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
              <label className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-2">
                Lista de alergias o dietas (separadas por comas)
              </label>
              <textarea
                className="w-full p-4 rounded-xl border border-[#241B10]/15 dark:border-[#F5E6CD]/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none bg-[#FCF6EC] dark:bg-[#221B12] text-[#241B10] dark:text-[#F8F2E6]"
                placeholder="Ej: Gluten, Lactosa, Cacahuetes, Dieta Keto..."
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              />
            </div>
          )}
        </section>

        {/* Ingredientes NO deseados (Separado - Estilo Clean) */}
        <section className="bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-4 border-b border-[#241B10]/5 dark:border-[#F5E6CD]/10 pb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Ban className="w-5 h-5 text-[#5C4E3A] dark:text-[#A89C86]" />
            </div>
            <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Preferencias de Ingredientes</h2>
          </div>

          <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
             <label className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-2">
                Ingredientes que NO te gustan (Opcional)
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-xl border border-[#241B10]/15 dark:border-[#F5E6CD]/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-[#FCF6EC] dark:bg-[#221B12] text-[#241B10] dark:text-[#F8F2E6]"
                placeholder="Ej: Cilantro, Cebolla, Pimiento..."
                value={profile.disliked_ingredients}
                onChange={(e) => setProfile({ ...profile, disliked_ingredients: e.target.value })}
              />
              <p className="text-xs text-[#8C7C63] dark:text-[#7C715E] mt-2">
                La IA evitará activamente incluir estos ingredientes en tus recetas.
              </p>
          </div>
        </section>

        {/* Utensilios */}
        <section className="bg-white dark:bg-[#18130D] p-6 rounded-2xl border border-[#241B10]/10 dark:border-[#F5E6CD]/10 shadow-sm transition-all">
          <div className="flex items-center gap-3 mb-4 border-b border-[#241B10]/5 dark:border-[#F5E6CD]/10 pb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <UtensilsCrossed className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">Utensilios de Cocina</h2>
          </div>

          <Toggle 
            label="Limitar a mis utensilios disponibles" 
            description="Solo se generarán recetas que puedas cocinar con tu equipo (Guarda solo en sesión actual)."
            checked={profile.use_utensils || false}
            onChange={(val) => setProfile({...profile, use_utensils: val})}
          />

          {profile.use_utensils && (
            <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
              <label className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-2">
                ¿Qué tienes en tu cocina?
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-xl border border-[#241B10]/15 dark:border-[#F5E6CD]/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-[#FCF6EC] dark:bg-[#221B12] text-[#241B10] dark:text-[#F8F2E6]"
                placeholder="Ej: Batidora, Horno, Air Fryer, Sartén..."
                value={profile.available_utensils || ''}
                onChange={(e) => setProfile({ ...profile, available_utensils: e.target.value })}
              />
              <p className="text-xs text-[#8C7C63] dark:text-[#6E6350] mt-2">
                Deja esto en blanco si tienes una cocina estándar equipada.
              </p>
            </div>
          )}
        </section>

        {/* Save Button Action */}
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