import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { FaRecycle, FaChartLine, FaUsers, FaTools, FaCheckCircle, FaTrashAlt, FaQuoteLeft, FaStar, FaMapMarkedAlt, FaShieldAlt, FaChartBar } from 'react-icons/fa';

// --- KOMPONEN HELPER ---

// Komponen Helper untuk Metrik Card dengan Animasi Counter
// eslint-disable-next-line no-unused-vars
const MetricCard = ({ title, value, unit, icon: IconComponent, color }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = React.useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isVisible) {
            let start = 0;
            const end = value;
            const duration = 2000;
            const increment = Math.ceil(end / (duration / 16));
            
            const timer = setInterval(() => {
                start += increment;
                if (start > end) start = end;

                setDisplayValue(start);
                if (start === end) clearInterval(timer);
            }, 16);
            
            return () => clearInterval(timer);
        }
    }, [isVisible, value]);

    const formatValue = (val) => val.toLocaleString('id-ID');

    return (
        <div 
            ref={cardRef}
            style={{ 
                textAlign: 'center', 
                padding: '25px 20px', 
                backgroundColor: 'white', 
                borderRadius: '15px', 
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.6s ease-out',
                cursor: 'default',
                minWidth: '200px'
            }}
        >
            <IconComponent style={{ color: color, fontSize: '2.8rem', marginBottom: '15px', transition: 'transform 0.3s ease' }} />
            <p style={{ fontSize: '1rem', color: '#666', margin: 0, fontWeight: '500' }}>{title}</p>
            <h4 style={{ fontSize: '2.8rem', margin: '10px 0', color: color, transition: 'color 0.3s ease', fontWeight: '700' }}>
                {formatValue(displayValue)}
            </h4>
            <p style={{ fontSize: '1.1rem', color: '#666', margin: 0, fontWeight: '600' }}>{unit}</p>
        </div>
    );
};

// Komponen Helper untuk Feature Card dengan Hover Animation
// eslint-disable-next-line no-unused-vars
const FeatureCard = ({ title, description, icon: IconComponent, color, details }) => (
    <div 
        style={{ 
            maxWidth: '380px', 
            minWidth: '320px',
            flex: '1 1 auto',
            padding: '35px', 
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
            borderRadius: '15px', 
            backgroundColor: 'white', 
            borderTop: `5px solid ${color}`,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: 'translateY(0)',
            cursor: 'pointer',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        }}
    >
        <IconComponent style={{ fontSize: '2.8rem', display: 'block', marginBottom: '20px', color: color, transition: 'transform 0.3s ease' }} />
        <h4 style={{ color: color, fontSize: '1.5rem', marginTop: 0, marginBottom: '15px', transition: 'color 0.3s ease', fontWeight: '700', lineHeight: '1.3' }}>{title}</h4>
        <p style={{ lineHeight: '1.7', color: '#555', fontSize: '1.05rem', marginBottom: '20px' }}>{description}</p>
        {details && (
            <ul style={{ textAlign: 'left', marginTop: 'auto', paddingLeft: '20px', color: '#777', lineHeight: '1.6' }}>
                {details.map((detail, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>{detail}</li>
                ))}
            </ul>
        )}
    </div>
);

// Testimonial Card
const TestimonialCard = ({ quote, author, rating, accentColor = '#f39c12' }) => (
    <div style={{ 
        maxWidth: '380px', 
        minWidth: '300px',
        flex: '1 1 auto',
        padding: '35px', 
        backgroundColor: 'white', 
        borderRadius: '15px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
        textAlign: 'center',
        transition: 'all 0.3s ease',
        transform: 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div>
            <FaQuoteLeft style={{ color: '#78C33E', fontSize: '2.2rem', marginBottom: '20px' }} />
            <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '25px', lineHeight: '1.7', fontSize: '1.05rem' }}>"{quote}"</p>
        </div>
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '15px' }}>
                {[...Array(rating)].map((_, i) => <FaStar key={i} style={{ color: accentColor, fontSize: '1.2rem' }} />)}
            </div>
            <h5 style={{ margin: 0, color: '#333', fontWeight: '600', fontSize: '1.05rem' }}>{author}</h5>
        </div>
    </div>
);

// Supporting Feature Card
// eslint-disable-next-line no-unused-vars
const SupportingFeatureCard = ({ title, description, icon: IconComponent, color }) => (
    <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        padding: '25px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
        marginBottom: '20px',
        transition: 'all 0.3s ease',
        borderLeft: `4px solid ${color}`
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(10px)';
        e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    }}
    >
        <IconComponent style={{ fontSize: '2rem', color: color, marginRight: '20px', minWidth: '35px', marginTop: '3px' }} />
        <div>
            <h5 style={{ margin: '0 0 8px 0', color: color, fontSize: '1.2rem', fontWeight: '700' }}>{title}</h5>
            <p style={{ margin: 0, color: '#666', fontSize: '1rem', lineHeight: '1.6' }}>{description}</p>
        </div>
    </div>
);

// --- KOMPONEN UTAMA ---
function LandingPage() {
    const [metrics, setMetrics] = useState({
        tpsRegistered: 0,
        totalReports: 0,
        totalPoints: 0,
        totalEmergencies: 0,
    });

    // Warna tema (align with CSS :root)
    const primaryColor = '#78C33E'; 
    const secondaryColor = '#1DAE9D';
    const errorColor = '#e74c3c';
    const darkBg = '#2c3e50';
    const accentColor = '#f39c12';

    // --- FUNGSI PENGAMBILAN DATA ---
    useEffect(() => {
        const fetchGlobalMetrics = async () => {
            try {
                const tpsQ = query(collection(db, 'users'), where('role', '==', 'TPS'));
                const tpsSnap = await getDocs(tpsQ);

                const reportsQ = query(collection(db, 'reports'));
                const reportsSnap = await getDocs(reportsQ);
                
                const emergencyQ = query(collection(db, 'emergency_requests'));
                const emergencySnap = await getDocs(emergencyQ);

                const usersQ = query(collection(db, 'users'), where('role', '==', 'Masyarakat'));
                const usersSnap = await getDocs(usersQ);
                let totalGlobalPoints = 0;
                usersSnap.forEach(doc => {
                    totalGlobalPoints += doc.data().points || 0;
                });

                setMetrics({
                    tpsRegistered: tpsSnap.size,
                    totalReports: reportsSnap.size,
                    totalEmergencies: emergencySnap.size,
                    totalPoints: totalGlobalPoints,
                });
            } catch (err) {
                console.error("Gagal mengambil metrik Landing Page:", err);
            }
        };

        fetchGlobalMetrics();
    }, []);

    // Sample testimonials
    const testimonials = [
        { quote: "SiBersih mengubah cara saya mengelola sampah sehari-hari. Poin yang didapat bisa ditukar reward nyata!", author: "Siti Rahman, Masyarakat Jakarta", rating: 5 },
        { quote: "Sebagai pengelola TPS, aplikasi ini memudahkan koordinasi jemputan darurat. Sangat efisien!", author: "Budi Santoso, TPS Bandung", rating: 5 },
        { quote: "Marketplace-nya brilian! Saya bisa jual daur ulang langsung tanpa ribet.", author: "Dewi Kartika, Penjual Daur Ulang", rating: 4 },
    ];

    // Data untuk fitur unggulan
    const keyFeatures = [
        {
            title: "Sistem Bank Sampah Digital & Poin Otomatis",
            description: "Mendapat reward poin yang adil dan transparan hanya dengan menyetorkan sampah daur ulang.",
            icon: FaCheckCircle,
            color: primaryColor,
            details: [
                "Poin dihitung otomatis oleh sistem saat TPS mengonfirmasi setoran (anti-curang)",
                "Didukung Firestore Batches untuk keamanan transaksi"
            ]
        },
        {
            title: "Pelaporan Canggih Berbasis Lokasi (GPS & Foto)",
            description: "Laporkan tumpukan sampah ilegal dengan akurat, melampirkan bukti foto dan lokasi persis di peta.",
            icon: FaTools,
            color: secondaryColor,
            details: [
                "Menggunakan GeoPoint Firestore untuk lokasi tepat",
                "Penyimpanan foto via Cloudinary untuk kredibilitas laporan"
            ]
        },
        {
            title: "Marketplace Daur Ulang & Chat COD Real-time",
            description: "Jual sampah daur ulang langsung ke pembeli tanpa pihak ketiga yang merepotkan.",
            icon: FaRecycle,
            color: secondaryColor,
            details: [
                "Komunikasi via chat bawaan aplikasi (bukan email)",
                "Transparan dan cepat untuk ekonomi sirkular lokal"
            ]
        }
    ];

    // Fitur pendukung
    const supportingFeatures = [
        {
            title: "Sistem Peta & Pemilihan TPS",
            description: "Pilih TPS tujuan terdekat saat mengajukan jemputan darurat untuk proses lebih terstruktur.",
            icon: FaMapMarkedAlt,
            color: primaryColor
        },
        {
            title: "Audit Lintas Peran",
            description: "TPS upload bukti foto untuk konfirmasi penyelesaian, diikuti persetujuan Masyarakat sebelum pembayaran.",
            icon: FaShieldAlt,
            color: accentColor
        },
        {
            title: "Dashboard Admin Global",
            description: "Pantau seluruh aktivitas (transaksi, laporan, lokasi TPS) dari dashboard web React yang aman.",
            icon: FaChartBar,
            color: secondaryColor
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', color: '#333', fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif' }}>
            
            {/* HEADER Navigasi */}
            <header style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '15px 50px',
                backgroundColor: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                transition: 'background-color 0.3s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderBottom: '1px solid rgba(120,195,62,0.2)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    position: 'relative'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        position: 'absolute',
                        left: 0
                    }}>
                        <img 
                            src="LOGO SiBersih.png" 
                            alt="SiBersih Logo" 
                            style={{ 
                                height: '60px', 
                                width: 'auto' 
                            }} 
                        />
                        <span style={{ 
                            fontSize: '1.8rem', 
                            fontWeight: '800', 
                            color: secondaryColor,
                            letterSpacing: '-0.5px',
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>SiBersih</span>
                    </div>
                    <nav style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '40px',
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}>
                        <a href="#home" style={{ 
                            textDecoration: 'none', 
                            color: '#333', 
                            fontWeight: '500',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            paddingBottom: '5px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = secondaryColor;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >Beranda</a>
                        <a href="#metrics" style={{ 
                            textDecoration: 'none', 
                            color: '#333', 
                            fontWeight: '500',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            paddingBottom: '5px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = secondaryColor;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >Statistik</a>
                        <a href="#features" style={{ 
                            textDecoration: 'none', 
                            color: '#333', 
                            fontWeight: '500',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            paddingBottom: '5px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = secondaryColor;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >Fitur</a>
                        <a href="#supporting" style={{ 
                            textDecoration: 'none', 
                            color: '#333', 
                            fontWeight: '500',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            paddingBottom: '5px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = secondaryColor;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >Pendukung</a>
                        <a href="#testimonials" style={{ 
                            textDecoration: 'none', 
                            color: '#333', 
                            fontWeight: '500',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            paddingBottom: '5px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = secondaryColor;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >Testimoni</a>
                    </nav>
                    <Link to="/login" style={{ 
                        textDecoration: 'none', 
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        color: 'white', 
                        padding: '12px 25px', 
                        borderRadius: '25px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 10px rgba(29,174,157,0.3)',
                        display: 'inline-block',
                        position: 'absolute',
                        right: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(29,174,157,0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(29,174,157,0.3)';
                    }}
                    >
                        Login Admin
                    </Link>
                </div>
            </header>

            {/* SEKSI 1: HERO */}
            <section style={{ 
                textAlign: 'center', 
                padding: '180px 30px 120px',
                backgroundImage: `url('background.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
            id="home"
            >
                {/* Overlay untuk readability dengan sedikit hijau */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, rgba(120, 195, 62, 0.4) 0%, rgba(29, 174, 157, 0.2) 50%, rgba(0, 0, 0, 0.4) 100%)`,
                    zIndex: 1
                }}></div>
                {/* Animated Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cg fill=\'none\' stroke=\'%23ffffff\' stroke-opacity=\'0.1\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'40\'/%3E%3C/g%3E%3C/svg%3E")',
                    animation: 'float 6s ease-in-out infinite',
                    zIndex: 2
                }}></div>
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    html {
                        scroll-behavior: smooth;
                    }
                `}</style>
                <div style={{ position: 'relative', zIndex: 3 }}>
                    <h2 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
                        marginBottom: '25px', 
                        lineHeight: '1.2',
                        opacity: 0,
                        animation: 'fadeInUp 1s ease 0.5s forwards',
                        position: 'relative',
                        zIndex: 1,
                        fontWeight: '800',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Sistem Manajemen Sampah Terintegrasi
                    </h2>
                    <p style={{ 
                        fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', 
                        marginBottom: '50px', 
                        maxWidth: '850px', 
                        margin: '0 auto 50px',
                        opacity: 0,
                        animation: 'fadeInUp 1s ease 0.8s forwards',
                        position: 'relative',
                        zIndex: 1,
                        lineHeight: '1.6',
                        fontWeight: '400',
                        padding: '0 20px'
                    }}>
                        Ubah Sampah Jadi Nilai, Bersama <strong style={{color: '#FFD700', fontWeight: '700'}}>SiBersih</strong>! Platform inovatif yang menghubungkan Masyarakat, TPS, dan Lingkungan dengan fitur canggih berbasis AI untuk pemantauan real-time.
                    </p>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '20px',
                        opacity: 0,
                        animation: 'fadeInUp 1s ease 1.1s forwards',
                        position: 'relative',
                        zIndex: 1,
                        flexWrap: 'wrap',
                        padding: '0 20px'
                    }}>
                        <a 
                            href="#" 
                            style={{ 
                                backgroundColor: 'white', 
                                color: primaryColor, 
                                padding: '18px 40px', 
                                borderRadius: '50px', 
                                textDecoration: 'none', 
                                fontWeight: '700',
                                fontSize: '1.05rem',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease',
                                display: 'inline-block'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                            }}
                        >
                            Download Aplikasi (APK)
                        </a>
                        <a 
                            href="#features" 
                            style={{ 
                                backgroundColor: 'transparent', 
                                color: 'white', 
                                padding: '18px 40px', 
                                border: `2px solid white`,
                                borderRadius: '50px', 
                                textDecoration: 'none', 
                                fontWeight: '700',
                                fontSize: '1.05rem',
                                transition: 'all 0.3s ease',
                                display: 'inline-block'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = primaryColor;
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Pelajari Lebih Lanjut
                        </a>
                    </div>
                </div>
            </section>
            
            {/* SEKSI 2: METRIK DAMPAK */}
            <section style={{ 
                padding: '100px 30px', 
                backgroundColor: 'white',
                borderBottom: '1px solid #eee'
            }}
            id="metrics"
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ 
                        textAlign: 'center', 
                        color: darkBg, 
                        marginBottom: '15px', 
                        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                        fontWeight: '700'
                    }}>Statistik Jaringan SiBersih 2025</h3>
                    <p style={{
                        textAlign: 'center',
                        color: '#666',
                        marginBottom: '60px',
                        fontSize: '1.1rem',
                        maxWidth: '700px',
                        margin: '0 auto 60px',
                        lineHeight: '1.6'
                    }}>Dampak nyata dari kolaborasi ribuan pengguna di seluruh Indonesia</p>
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '30px',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        <MetricCard 
                            title="Poin Diberikan (Global)" 
                            value={metrics.totalPoints} 
                            unit="POIN" icon={FaChartLine} color={secondaryColor} 
                        />
                        <MetricCard 
                            title="Total Laporan Masuk" 
                            value={metrics.totalReports} 
                            unit="Laporan" icon={FaTrashAlt} color={errorColor} 
                        />
                        <MetricCard 
                            title="Permintaan Emergensi" 
                            value={metrics.totalEmergencies} 
                            unit="Permintaan" icon={FaTools} color={secondaryColor} 
                        />
                        <MetricCard 
                            title="TPS Terdaftar" 
                            value={metrics.tpsRegistered} 
                            unit="Lokasi" icon={FaUsers} color={primaryColor} 
                        />
                    </div>
                </div>
            </section>

            {/* SEKSI 3: FITUR UNGGULAN */}
            <section style={{ padding: '100px 30px', textAlign: 'center', backgroundColor: '#f8f9fa' }} id="features">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ color: secondaryColor, fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '15px', fontWeight: '700' }}>3 Fitur Unggulan Utama SiBersih</h3>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '70px', maxWidth: '800px', margin: '0 auto 70px', lineHeight: '1.6' }}>
                        Fitur-fitur inovatif yang membedakan SiBersih dari aplikasi sampah konvensional, dirancang untuk kemudahan, keamanan, dan dampak lingkungan maksimal.
                    </p>
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '40px',
                        justifyItems: 'center'
                    }}>
                        {keyFeatures.map((feature, index) => (
                            <FeatureCard 
                                key={index}
                                title={feature.title} 
                                description={feature.description}
                                icon={feature.icon} 
                                color={feature.color}
                                details={feature.details}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* SEKSI 4: FITUR PENDUKUNG */}
            <section style={{ 
                padding: '100px 30px', 
                backgroundColor: 'white',
                textAlign: 'center'
            }}
            id="supporting"
            >
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h3 style={{ color: primaryColor, fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '15px', fontWeight: '700' }}>Fitur Pendukung Operasional</h3>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '60px', maxWidth: '750px', margin: '0 auto 60px', lineHeight: '1.6' }}>
                        SiBersih adalah ekosistem lengkap yang memastikan operasional lancar, akuntabilitas tinggi, dan pemantauan real-time untuk semua pengguna.
                    </p>
                    <div style={{ 
                        textAlign: 'left'
                    }}>
                        {supportingFeatures.map((feature, index) => (
                            <SupportingFeatureCard 
                                key={index}
                                title={feature.title}
                                description={feature.description}
                                icon={feature.icon}
                                color={feature.color}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* SEKSI 5: TESTIMONIALS */}
            <section style={{ 
                padding: '100px 30px', 
                backgroundColor: '#f0f8f0',
                textAlign: 'center'
            }}
            id="testimonials"
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ color: primaryColor, fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '15px', fontWeight: '700' }}>Apa Kata Pengguna Kami</h3>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '60px', maxWidth: '700px', margin: '0 auto 60px', lineHeight: '1.6' }}>
                        Ribuan pengguna telah bergabung dan merasakan dampak positif SiBersih terhadap lingkungan dan komunitas.
                    </p>
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '40px',
                        justifyItems: 'center'
                    }}>
                        {testimonials.map((testimonial, index) => (
                            <TestimonialCard 
                                key={index}
                                quote={testimonial.quote}
                                author={testimonial.author}
                                rating={testimonial.rating}
                                accentColor={accentColor}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* SEKSI 6: CALL TO ACTION */}
            <section style={{ 
                padding: '100px 30px', 
                textAlign: 'center', 
                background: `linear-gradient(135deg, ${darkBg} 0%, #34495e 100%)`, 
                color: 'white'
            }}
            id="cta"
            >
                <h3 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '20px', fontWeight: '700' }}>Siap Bergabung dengan Gerakan SiBersih?</h3>
                <p style={{ marginBottom: '45px', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 45px', lineHeight: '1.6' }}>
                    Mulai hari ini: Dapatkan poin, bersihkan lingkungan, dan dukung TPS lokal Anda. Aplikasi gratis untuk semua!
                </p>
                <a 
                    href="#" 
                    style={{ 
                        backgroundColor: primaryColor, 
                        color: 'white', 
                        padding: '18px 50px', 
                        borderRadius: '50px', 
                        textDecoration: 'none', 
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 20px rgba(120,195,62,0.4)',
                        transition: 'all 0.3s ease',
                        display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(120,195,62,0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(120,195,62,0.4)';
                    }}
                >
                    Unduh Sekarang dan Mulai Membersihkan
                </a>
            </section>
            
            {/* FOOTER */}
            <footer style={{ 
                padding: '50px 30px', 
                textAlign: 'center', 
                backgroundColor: '#2c3e50', 
                color: '#ecf0f1'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '30px'
                }}>
                    <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
                        <img 
                            src="LOGO SiBersih.png" 
                            alt="SiBersih Logo" 
                            style={{ 
                                height: '40px', 
                                width: 'auto', 
                                marginBottom: '15px' 
                            }} 
                        />
                        <p style={{ margin: 0, color: '#bdc3c7', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            Sistem Manajemen Sampah Terintegrasi untuk Indonesia yang lebih bersih dan hijau.
                        </p>
                    </div>
                    <div style={{ flex: '1 1 200px', textAlign: 'left' }}>
                        <h4 style={{ color: '#ecf0f1', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '700' }}>Tautan Cepat</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/privacy" style={{ 
                                color: '#bdc3c7', 
                                textDecoration: 'none', 
                                transition: 'color 0.3s',
                                fontSize: '0.95rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#bdc3c7'}
                            >Kebijakan Privasi</Link>
                            <Link to="/terms" style={{ 
                                color: '#bdc3c7', 
                                textDecoration: 'none', 
                                transition: 'color 0.3s',
                                fontSize: '0.95rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#bdc3c7'}
                            >Syarat & Ketentuan</Link>
                            <a href="mailto:support@sibersih.id" style={{ 
                                color: '#bdc3c7', 
                                textDecoration: 'none', 
                                transition: 'color 0.3s',
                                fontSize: '0.95rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#bdc3c7'}
                            >Hubungi Kami</a>
                        </div>
                    </div>
                </div>
                <div style={{ 
                    marginTop: '40px', 
                    paddingTop: '30px', 
                    borderTop: '1px solid #34495e',
                    color: '#95a5a6',
                    fontSize: '0.9rem'
                }}>
                    <p style={{ margin: 0 }}>© 2025 SiBersih. Dibuat untuk Lingkungan yang Lebih Baik. Semua hak dilindungi.</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;