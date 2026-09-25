/**
 * Texto de un paso de la guía de instalación (`common.installModal.stepN`), con
 * la parte clave en negrita. Lo comparten la guía modal y la sección de la
 * landing para que los pasos se lean igual en los dos sitios.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface InstallStepTextProps {
  step: 'step1' | 'step2' | 'step3';
}

const InstallStepText: React.FC<InstallStepTextProps> = ({ step }) => {
  const { t } = useTranslation();
  const after = t(`common.installModal.${step}.after`);

  return (
    <>
      {t(`common.installModal.${step}.before`)}{' '}
      <strong className="text-ink dark:text-ink-light">{t(`common.installModal.${step}.bold`)}</strong>
      {/* espacio solo si lo que sigue es texto ("o Añadir…"), no puntuación (".") */}
      {/^\p{L}/u.test(after) ? ' ' : ''}
      {after}
    </>
  );
};

export default InstallStepText;
