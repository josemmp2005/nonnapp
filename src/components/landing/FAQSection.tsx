import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { SectionHeading, Reveal } from './shared';

interface Faq {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const faqs = t('landing.faq.items', { returnObjects: true }) as Faq[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-paper dark:bg-paper-dark border-t border-ink/10 dark:border-ink-light/10 py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6">
        <SectionHeading eyebrow={t('landing.faq.eyebrow')} title={t('landing.faq.title')} align="center" className="mb-10" />

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.question} delayMs={i * 60}>
                <div className="border border-ink/10 dark:border-ink-light/10 rounded-xl overflow-hidden bg-cream dark:bg-surface-dark">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-sm text-ink dark:text-ink-light">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed text-muted dark:text-muted-dark">{faq.answer}</p>
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
