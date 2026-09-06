import LandingHeader from './landing/LandingHeader';
import HeroSection from './landing/HeroSection';
import CuisineCategories from './landing/CuisineCategories';
import FeatureCards from './landing/FeatureCards';
import RoleCards from './landing/RoleCards';
import HowItWorks from './landing/HowItWorks';
import PopularRestaurants from './landing/PopularRestaurants';
import Testimonials from './landing/Testimonials';
import OwnerCTA from './landing/OwnerCTA';
import LandingFooter from './landing/LandingFooter';

export default function LandingPage() {
    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', background: '#F8FAFC', overflowX: 'hidden' }}>
            <LandingHeader theme="light" />
            <HeroSection />
            {/* Distinct Full-Width Section for Categories & Feature Cards */}
            <section style={{
                width: '100%',
                background: '#FFF7ED',
                borderTop: '1px solid #FED7AA',
                borderBottom: '1px solid #FED7AA',
                padding: '64px 0 72px',
                position: 'relative',
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    width: '100%',
                    padding: '0 48px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 40,
                }}>
                    <CuisineCategories />
                    <FeatureCards />
                </div>
            </section>
            <RoleCards />
            <HowItWorks />
            <PopularRestaurants />
            <Testimonials />
            <OwnerCTA />
            <LandingFooter />
        </div>
    );
}
