import React, { useState } from 'react';
import { X, Check, CreditCard, Loader2, Crown, ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react';
import type { SubscriptionPlan } from '../types';
import { changeSubscription } from '../services/data';
import type { PlanTypeLower } from '../services/data';
import { useToast } from '../context/ToastContext';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface PlanInfo {
  key: PlanTypeLower;
  display: SubscriptionPlan;
  price: string;
  priceLabel: string;
  tagline: string;
  features: string[];
}

// Precios y features solo de cara al usuario (copy) — la fuente de verdad de
// qué desbloquea cada plan de verdad es PLAN_LIMITS en SubscriptionContext.tsx.
const PLANS: PlanInfo[] = [
  {
    key: 'nipote',
    display: 'Nipote',
    price: '0€',
    priceLabel: 'Gratis para siempre',
    tagline: 'Para probar la app',
    features: ['2 recetas al día', 'Modo texto libre', 'Últimas 3 recetas en el historial'],
  },
  {
    key: 'mamma',
    display: 'Mamma',
    price: '4,99€',
    priceLabel: '/ mes',
    tagline: 'Para cocinar de verdad',
    features: [
      'Recetas ilimitadas',
      'Modo despensa (usa lo que tienes)',
      'Alergias, ingredientes y utensilios personalizados',
      'Historial completo',
    ],
  },
  {
    key: 'nonna',
    display: 'Nonna',
    price: '9,99€',
    priceLabel: '/ mes',
    tagline: 'La experiencia completa',
    features: [
      'Todo lo de La Mamma',
      'Chat con el chef',
      'La Mesa de la Nonna',
      'Planificador semanal',
      'Soporte prioritario',
    ],
  },
];

type Step = 'select' | 'pay' | 'confirmCancel';

interface Props {
  currentPlan: SubscriptionPlan;
  onClose: () => void;
  onChanged: () => void;
}

const PlanCheckoutModal: React.FC<Props> = ({ currentPlan, onClose, onChanged }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('select');
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCardNumber = (raw: string) =>
    raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handleSelectPlan = (plan: PlanInfo) => {
    if (plan.display === currentPlan) return;
    setSelectedPlan(plan);
    setStep(plan.key === 'nipote' ? 'confirmCancel' : 'pay');
  };

  const applyChange = async (planKey: PlanTypeLower, successMessage: string) => {
    setIsProcessing(true);
    const { error } = await changeSubscription(planKey);
    setIsProcessing(false);
    if (error) {
      showToast(error.message || 'No se pudo cambiar de plan', 'error');
      return;
    }
    showToast(successMessage, 'success');
    onChanged();
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvc.length < 3 || !cardName.trim()) {
      showToast('Completa los datos de la tarjeta (esto es una simulación, cualquier número vale).', 'error');
      return;
    }
    setIsProcessing(true);
    // Simulación: sin pasarela real. El delay es solo para que se sienta como
    // un pago de verdad — no hay ningún cargo, ninguna llamada externa.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsProcessing(false);
    await applyChange(selectedPlan.key, `¡Bienvenida a La ${selectedPlan.display}! Tu plan ya está activo.`);
  };

  const handleConfirmCancel = () => {
    applyChange('nipote', 'Tu suscripción se canceló. Has vuelto a Il Nipote.');
  };

  const inputClass =
    'w-full p-3 rounded-xl border border-[#241B10]/15 dark:border-[#F5E6CD]/15 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-[#FCF6EC] dark:bg-[#221B12] text-[#241B10] dark:text-[#F8F2E6]';

  useEscapeKey(() => {
    if (!isProcessing) onClose();
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-checkout-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        className="bg-white dark:bg-[#130F0A] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#241B10]/10 dark:border-[#F5E6CD]/10 bg-primary text-white flex-shrink-0">
          <h3 id="plan-checkout-title" className="text-lg font-bold flex items-center gap-2">
            <Crown aria-hidden="true" className="w-5 h-5" />
            {step === 'select'
              ? 'Cambiar de plan'
              : step === 'pay'
                ? `Actualizar a La ${selectedPlan?.display}`
                : 'Cancelar suscripción'}
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Cerrar"
            className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div key={step} className="overflow-y-auto p-6 animate-in fade-in duration-200">
          {step === 'select' && (
            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = plan.display === currentPlan;
                return (
                  <div
                    key={plan.key}
                    className={`rounded-2xl border-2 p-5 flex flex-col transition ${
                      isCurrent
                        ? 'border-primary bg-primary/5'
                        : 'border-[#241B10]/10 dark:border-[#F5E6CD]/10 hover:border-primary/40'
                    }`}
                  >
                    <h4 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6]">La {plan.display}</h4>
                    <p className="text-xs text-[#6B5D48] dark:text-[#9A8D74] mb-3">{plan.tagline}</p>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-extrabold text-[#241B10] dark:text-[#F8F2E6]">{plan.price}</span>
                      <span className="text-xs text-[#6B5D48] dark:text-[#9A8D74]">{plan.priceLabel}</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-[#3A2E1D] dark:text-[#D4D4D8]">
                          <Check aria-hidden="true" className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                        isCurrent
                          ? 'bg-primary/10 text-primary cursor-default'
                          : 'bg-primary hover:bg-orange-600 text-white active:scale-95'
                      }`}
                    >
                      {isCurrent ? 'Plan actual' : plan.key === 'nipote' ? 'Cambiar a este plan' : 'Elegir este plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {step === 'pay' && selectedPlan && (
            <form onSubmit={handleConfirmPayment} className="space-y-4 max-w-md mx-auto">
              <div className="flex items-start gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg p-3">
                <ShieldCheck aria-hidden="true" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Simulación de pago — no hay pasarela real ni se te va a cobrar nada. Cualquier dato de tarjeta funciona.
              </div>

              <div className="flex items-baseline justify-between p-4 rounded-xl bg-[#FCF6EC] dark:bg-[#221B12] border border-[#241B10]/10 dark:border-[#F5E6CD]/10">
                <span className="text-sm text-[#6B5D48] dark:text-[#9A8D74]">La {selectedPlan.display} · mensual</span>
                <span className="text-xl font-extrabold text-[#241B10] dark:text-[#F8F2E6]">{selectedPlan.price}</span>
              </div>

              <div>
                <label htmlFor="checkout-card-name" className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-1">Nombre en la tarjeta</label>
                <input
                  id="checkout-card-name"
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Como aparece en la tarjeta"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="checkout-card-number" className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-1">Número de tarjeta</label>
                <div className="relative">
                  <CreditCard aria-hidden="true" className="absolute left-3 top-3.5 w-5 h-5 text-[#6B5D48]" />
                  <input
                    id="checkout-card-number"
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-card-expiry" className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-1">Caducidad</label>
                  <input
                    id="checkout-card-expiry"
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="checkout-card-cvc" className="block text-sm font-medium text-[#3A2E1D] dark:text-[#D4D4D8] mb-1">CVC</label>
                  <input
                    id="checkout-card-cvc"
                    type="text"
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                  </>
                ) : (
                  `Pagar ${selectedPlan.price} y activar`
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('select')}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-[#6B5D48] dark:text-[#9A8D74] hover:text-primary active:scale-95 transition disabled:opacity-50"
              >
                <ArrowLeft aria-hidden="true" className="w-4 h-4" /> Volver a los planes
              </button>
            </form>
          )}

          {step === 'confirmCancel' && (
            <div className="max-w-md mx-auto text-center py-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle aria-hidden="true" className="w-7 h-7 text-amber-500" />
              </div>
              <h4 className="text-lg font-bold text-[#241B10] dark:text-[#F8F2E6] mb-2">
                ¿Cancelar tu suscripción?
              </h4>
              <p className="text-sm text-[#6B5D48] dark:text-[#9A8D74] mb-6">
                Volverás a Il Nipote: perderás el modo despensa y la personalización de alergias/ingredientes
                {currentPlan === 'Nonna' ? ', además del chat del chef y La Mesa de la Nonna' : ''}. El límite pasará a 2 recetas al día.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep('select')}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border border-[#241B10]/15 dark:border-[#F5E6CD]/15 text-[#3A2E1D] dark:text-[#D4D4D8] hover:bg-[#241B10]/5 dark:hover:bg-white/5 active:scale-95 transition disabled:opacity-50"
                >
                  Seguir con mi plan
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanCheckoutModal;
