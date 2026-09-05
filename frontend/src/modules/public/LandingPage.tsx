import LandingHeader from './landing/LandingHeader';
import HeroSection from './landing/HeroSection';
import CuisineCategories from './landing/CuisineCategories';
import FeatureCards from './landing/FeatureCards';
import RoleCards from './landing/RoleCards';
import HowItWorks from './landing/HowItWorks';
import PopularRestaurants from './landing/PopularRestaurants';
import StatsSection from './landing/StatsSection';
import Testimonials from './landing/Testimonials';
import OwnerCTA from './landing/OwnerCTA';
import LandingFooter from './landing/LandingFooter';

export default function LandingPage() {
    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#F8FAFC', overflowX: 'hidden' }}>
            <LandingHeader />
            <HeroSection />
            <CuisineCategories />
            <FeatureCards />
            <RoleCards />
            <HowItWorks />
            <PopularRestaurants />
            <StatsSection />
            <Testimonials />
            <OwnerCTA />
            <LandingFooter />
        </div>
    );
}
