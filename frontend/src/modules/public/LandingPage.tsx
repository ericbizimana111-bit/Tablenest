import LandingHeader from './landing/LandingHeader';
import HeroSection from './landing/HeroSection';
import OurStorySection from './landing/OurStorySection';
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

            {/* 1. Main Hero Section (with search and Get Started / Book Restaurants buttons) */}
            <HeroSection />

            {/* 2. Our Story Section (Crafted with love, spiced with passion) */}
            <OurStorySection />

            {/* 3. Trending Now / Popular Dishes */}
            <PopularDishes />

            {/* 4. Why Choose Us */}
            <WhyChooseUs />

            {/* 5. Special Offer Banner */}
            <SpecialOffer />

            {/* 6. What Clients Say (Testimonials) */}
            <Testimonials />

            {/* 7. What We Offer (Pillars) */}
            <WhatWeOffer />

            {/* 8. Footer */}
            <LandingFooter />
        </div>
    );
}
