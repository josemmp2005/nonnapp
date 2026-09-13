import React from 'react';
import HeroSection from './landing/HeroSection';
import StatsStripSection from './landing/StatsStripSection';
import MeetNonnaSection from './landing/MeetNonnaSection';
import HowItWorksSection from './landing/HowItWorksSection';
import FeaturesSection from './landing/FeaturesSection';
import PricingSection from './landing/PricingSection';
import FinalCtaSection from './landing/FinalCtaSection';

const LandingPage: React.FC = () => (
  <div className="overflow-hidden">
    <HeroSection />
    <StatsStripSection />
    <MeetNonnaSection />
    <HowItWorksSection />
    <FeaturesSection />
    <PricingSection />
    <FinalCtaSection />
  </div>
);

export default LandingPage;
