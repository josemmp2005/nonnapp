/**
 * Sección de la landing que explica cómo instalar la app desde el menú del
 * navegador (móvil, tablet u ordenador), en tres pasos válidos para cualquiera.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Share, SquarePlus, Check } from 'lucide-react';
import { SectionHeading, Reveal } from './shared';
import InstallStepText from '../InstallStepText';

// Los textos de los pasos son los mismos que la guía que se abre desde Editar
// perfil (common.installModal.*): un solo sitio donde cambiarlos.
const STEPS = [
  { key: 'step1', Icon: Share },
  { key: 'step2', Icon: SquarePlus },
  { key: 'step3', Icon: Check },
] as const;

const InstallSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="instalar" className="bg-paper dark:bg-paper-dark border-t border-ink/10 dark:border-ink-light/10 py-16 md:py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal>
          <SectionHeading
            eyebrow={t('landing.install.eyebrow')}
            title={t('landing.install.title')}
            subtitle={t('landing.install.subtitle')}
          />
          <p className="mt-5 text-xs text-muted dark:text-muted-dark">{t('landing.install.note')}</p>
        </Reveal>

        <ol className="space-y-4">
          {STEPS.map(({ key, Icon }, i) => (
            <li key={key}>
              <Reveal
                delayMs={i * 120}
                className="flex items-center gap-4 rounded-2xl bg-surface dark:bg-surface-dark border border-ink/10 dark:border-ink-light/10 shadow-sm p-5"
              >
                <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent">
                  <Icon aria-hidden="true" className="w-5 h-5" />
                </span>
                <span className="text-[15px] text-body dark:text-body-dark">
                  <InstallStepText step={key} />
                </span>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default InstallSection;
