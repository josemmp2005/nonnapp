/**
 * Página `/app/chef` (La Mesa de la Nonna): muestra la mesa completa de
 * estilos de cocina predefinidos para generar una receta con un toque.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Crown, Lock, ChefHat } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import ChefTableWidget from './ChefTableWidget';

const ChefPage: React.FC = () => {
  const { t } = useTranslation();
  const { limits } = useSubscription();
  const navigate = useNavigate();

  // Si no tiene acceso a la mesa de la nonna, mostrar paywall
  if (!limits.hasChefChat) {
    return (
      <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
        <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 overflow-hidden p-12 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-ink dark:text-[#F8F2E6] mb-4">
              La Mesa de la Nonna
            </h1>
            
            <p className="text-xl text-body dark:text-body-dark leading-relaxed mb-8">
              {t('app.chefPage.paywallDesc')}
            </p>

            <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-xl border border-amber-200 dark:border-amber-800 space-y-4 text-left">
              <h3 className="text-2xl font-bold text-ink dark:text-[#F8F2E6] mb-4 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary" />
                {t('app.chefPage.premiumFeaturesTitle')}
              </h3>
              <ul className="space-y-3 text-body dark:text-body-dark">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>{t('app.chefPage.feature1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>{t('app.chefPage.feature2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>{t('app.chefPage.feature3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl">✓</span>
                  <span>{t('app.chefPage.feature4')}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => navigate('/app/profile')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                {t('app.chefPage.upgradeButton')}
              </button>
              <button
                onClick={() => navigate('/app')}
                className="px-8 py-4 bg-ink/10 dark:bg-[#221B12] hover:bg-ink/20 dark:hover:bg-[#2A2114] text-body dark:text-[#F8F2E6] rounded-xl font-bold text-lg transition"
              >
                {t('app.chefPage.backToDashboard')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="relative rounded-3xl bg-gradient-to-r from-surface-dark to-paper-dark dark:from-black dark:to-cream-dark overflow-hidden mb-12 p-8 md:p-12 text-center md:text-left">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 max-w-2xl">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">{t('app.chefPage.heroEyebrow')}</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">La Mesa de la Nonna</h1>
            <p className="text-[#C3B89F] text-lg leading-relaxed">
               {t('app.chefPage.heroText')}
            </p>
         </div>
      </div>

      <ChefTableWidget variant="full" />
    </div>
  );
};

export default ChefPage;
