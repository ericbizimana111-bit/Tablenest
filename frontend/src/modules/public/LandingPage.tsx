import LandingHeader from './landing/LandingHeader';
import HeroSection from './landing/HeroSection';
import PopularDishes from './landing/PopularDishes';
import WhyChooseUs from './landing/WhyChooseUs';
import SpecialOffer from './landing/SpecialOffer';
import Testimonials from './landing/Testimonials';
import WhatWeOffer from './landing/WhatWeOffer';
import LandingFooter from './landing/LandingFooter';

export default function LandingPage() {
    return (
        <div style={{
            fontFamily: 'Poppins, sans-serif',
            background: '#FFFFFF',
            overflowX: 'hidden',
            width: '100%',
        }}>
            {/* Navigation Header */}
            <LandingHeader theme="light" />

            {/* 1. Hero & Our Story Section */}
            <HeroSection />

            {/* 2. Trending Now / Popular Dishes */}
            <PopularDishes />

            {/* 3. Why Choose Us */}
            <WhyChooseUs />

            {/* 4. Special Offer Banner */}
            <SpecialOffer />

            {/* 5. What Clients Say (Testimonials) */}
            <Testimonials />

            {/* 6. What We Offer (Pillars) */}
            <WhatWeOffer />

            {/* 7. Footer */}
            <LandingFooter />
        </div>
    );
}
