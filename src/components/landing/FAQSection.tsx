import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionHeading, Reveal } from './shared';

// Respuestas ancladas a lo que la app hace de verdad hoy (modo despensa de
// pago, historial automático en vez de "favoritos", nivel de habilidad
// gratis para todos, plan Il Nipote gratuito) — nada que prometa una
// funcionalidad que no existe.
const FAQS: { question: string; answer: string }[] = [
  {
    question: '¿Cómo genera Nonnapp las recetas?',
    answer:
      'Una IA analiza lo que le cuentas — ingredientes, tiempo disponible, tus preferencias de cocina — y genera una receta completa con pasos claros en cuestión de segundos.',
  },
  {
    question: '¿Puedo usar solo los ingredientes que tengo en casa?',
    answer:
      'Sí, el modo despensa prioriza los ingredientes que le indiques. Está disponible en los planes La Mamma y La Nonna; con el plan gratuito puedes describir lo que te apetece en modo texto libre.',
  },
  {
    question: '¿Puedo guardar mis recetas favoritas?',
    answer: 'Todas las recetas que generas se guardan automáticamente en tu historial, así que siempre puedes volver a consultarlas cuando quieras.',
  },
  {
    question: '¿Nonnapp tiene en cuenta alergias o preferencias?',
    answer:
      'Sí — puedes indicar alergias, ingredientes que no te gustan y tu nivel de cocina para que cada receta se adapte a ti. El nivel de habilidad es gratis para todos los planes; la personalización de alergias e ingredientes está en los planes de pago.',
  },
  {
    question: '¿Es gratis usar Nonnapp?',
    answer:
      'Sí, el plan Il Nipote es gratuito para siempre (2 recetas al día). Si quieres recetas ilimitadas y más personalización, puedes pasarte a La Mamma o La Nonna cuando quieras.',
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white dark:bg-[#0D0A06] border-t border-[#241B10]/10 dark:border-[#F5E6CD]/10 py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <SectionHeading eyebrow="Preguntas frecuentes" title="Todo lo que necesitas saber" align="center" className="mb-10" />

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.question} delayMs={i * 60}>
                <div className="border border-[#241B10]/10 dark:border-[#F5E6CD]/10 rounded-xl overflow-hidden bg-[#FCF6EC] dark:bg-[#18130D]">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-sm text-[#241B10] dark:text-[#F8F2E6]">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed text-[#5C4E3A] dark:text-[#A89C86]">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
