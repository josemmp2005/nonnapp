/**
 * Página `/`: compone las secciones de la landing pública (hero, cómo
 * funciona, demo, planes, preguntas frecuentes...).
 */

import React from 'react';
import HeroSection from './landing/HeroSection';
import FridgeToRecipeSection from './landing/FridgeToRecipeSection';
import HowItWorksSection from './landing/HowItWorksSection';
import StatsStripSection from './landing/StatsStripSection';
import DemoVideoSection from './landing/DemoVideoSection';
import RecipeShowcaseSection from './landing/RecipeShowcaseSection';
import NonnaSection from './landing/NonnaSection';
import InteractiveDemoSection from './landing/InteractiveDemoSection';
import PricingSection from './landing/PricingSection';
import FAQSection from './landing/FAQSection';
import FinalCtaSection from './landing/FinalCtaSection';

const LandingPage: React.FC = () => (
  <div className="overflow-hidden">
    <HeroSection />
    <FridgeToRecipeSection />
    <HowItWorksSection />
    <StatsStripSection />
    <DemoVideoSection />
    <RecipeShowcaseSection />
    <NonnaSection />
    <InteractiveDemoSection />
    <PricingSection />
    <FAQSection />
    <FinalCtaSection />
  </div>
);

export default LandingPage;
