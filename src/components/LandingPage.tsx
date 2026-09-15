import React from 'react';
import HeroSection from './landing/HeroSection';
import StatsStripSection from './landing/StatsStripSection';
import MeetNonnaSection from './landing/MeetNonnaSection';
import HowItWorksSection from './landing/HowItWorksSection';
import DemoVideoSection from './landing/DemoVideoSection';
import FridgeToRecipeSection from './landing/FridgeToRecipeSection';
import InteractiveDemoSection from './landing/InteractiveDemoSection';
import RecipeShowcaseSection from './landing/RecipeShowcaseSection';
import NonnaAISection from './landing/NonnaAISection';
import PricingSection from './landing/PricingSection';
import FAQSection from './landing/FAQSection';
import FinalCtaSection from './landing/FinalCtaSection';

const LandingPage: React.FC = () => (
  <div className="overflow-hidden">
    <HeroSection />
    <StatsStripSection />
    <MeetNonnaSection />
    <HowItWorksSection />
    <DemoVideoSection />
    <FridgeToRecipeSection />
    <InteractiveDemoSection />
    <RecipeShowcaseSection />
    <NonnaAISection />
    <PricingSection />
    <FAQSection />
    <FinalCtaSection />
  </div>
);

export default LandingPage;
