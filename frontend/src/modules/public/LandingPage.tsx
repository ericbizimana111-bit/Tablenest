import { useRef, useEffect } from 'react';
import LandingHeader from './landing/LandingHeader';
import HeroSection from './landing/HeroSection';
import OurStorySection from './landing/OurStorySection';
import PopularDishes from './landing/PopularDishes';
import WhyChooseUs from './landing/WhyChooseUs';
import SpecialOffer from './landing/SpecialOffer';
import Testimonials from './landing/Testimonials';
import WhatWeOffer from './landing/WhatWeOffer';
import NewsletterCTA from './landing/NewsletterCTA';
import LandingFooter from './landing/LandingFooter';

export default function LandingPage() {
    const shellRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        requestAnimationFrame(() => {
            if (!shellRef.current) return;
            shellRef.current.classList.add('is-ready');
        });
    }, []);
    const shellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        requestAnimationFrame(() => {
            if (!shellRef.current) return;
            shellRef.current.classList.add('is-ready');
        });
    }, []);

    return (
        <div
            ref={shellRef}
            className="page-shell"
            style={{
                fontFamily: 'Poppins, sans-serif',
                background: '#FFFFFF',
                overflowX: 'hidden',
                width: '100%',
            }}
        >
            {/* Navigation Header */}
            <LandingHeader theme="light" />

            {/* 1. HERO */}
            <HeroSection />

            {/* 2. WHAT WE OFFER */}
            <WhatWeOffer />

            {/* 3. REAL FOOD. REAL FLAVOR. */}
            <OurStorySection />

            {/* 4. TRENDING NOW */}
            <PopularDishes />

            {/* 5. GREAT MEALS, COLD DRINKS, GOOD TIMES. */}
            <WhyChooseUs />

            {/* 6. SPECIAL OFFER */}
            <SpecialOffer />

            {/* 7. TRUSTED BY DINERS AND RESTAURANTS */}
            <Testimonials />

            {/* 8. NEWSLETTER CTA */}
            <NewsletterCTA />

            {/* 9. FOOTER */}
            <LandingFooter />
        </div>
    );
}
