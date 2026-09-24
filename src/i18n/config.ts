import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';

export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'pt'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Primera pasada de idiomas: solo la landing pública y la cabecera/pie
// compartidos están traducidos (ver claves en locales/*.json). El resto de la
// app (dashboard, recetas, chat, legal) sigue solo en español — i18next
// simplemente no encuentra esas claves ahí, no falla; hay que ampliar los
// JSON de locales/ para cubrirlas en una pasada futura.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      pt: { translation: pt },
    },
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'nonnapp_lang',
    },
  });

// `lang` en <html> es lo que usan los lectores de pantalla para elegir la
// pronunciación — i18next no lo toca por su cuenta.
document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
