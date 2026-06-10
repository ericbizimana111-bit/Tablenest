import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Home, AlertCircle } from 'lucide-react';


export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF7F5' }}>
            {/* Navbar */}


            {/* Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 80px' }}>


                <div style={{ flex: 1, position: 'relative' }}>
                    <img
                        src="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=520&q=80"
                        alt="Chef"
                        style={{ width: '100%', maxWidth: 500, borderRadius: 16, objectFit: 'cover', height: 400 }}
                    />
                </div>




                <div style={{ maxWidth: 480 }}>
                    <div style={{ fontSize: 88, fontWeight: 800, color: '#B91C1C', lineHeight: 1, marginBottom: 16 }}>404</div>
                    <h2 style={{ fontSize: 30, fontWeight: 700, color: '#111827', marginBottom: 12, lineHeight: 1.3 }}>
                        Oops! This table is reserved<br />for someone else
                    </h2>
                    <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 1.7 }}>
                        We couldn't find the page you were looking for. It might have been moved, deleted, or perhaps it never existed in our menu.
                    </p>



                    <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>

                        <button onClick={() => navigate('/')}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 24px', background: '#B91C1C', color: 'white', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            <Home size={15} /> Back to Home
                        </button>

                        <button onClick={() => navigate('/restaurants')}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 24px', background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 9, fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'Poppins' }}>
                            <AlertCircle size={15} /> Report an Issue
                        </button>

                    </div>



                    <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>TRY SEARCHING FOR:</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['Fine Dining', 'Italian Cuisine', 'Late Night'].map(tag => (
                            <span key={tag} onClick={() => navigate(`/restaurants?search=${tag}`)}
                                style={{ padding: '7px 16px', border: '1.5px solid #E5E7EB', borderRadius: 9999, fontSize: 13, cursor: 'pointer', color: '#374151', background: 'white', fontWeight: 500 }}>
                                {tag}
                            </span>
                        ))}
                    </div>

                </div>
            </div>


        </div>
    );
}


