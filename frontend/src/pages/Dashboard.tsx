import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSweets, purchaseSweet, type Sweet } from '../api/sweets';
import SweetCard from '../components/SweetCard';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useResponsive } from '../hooks/useResponsive';

const Dashboard: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const { isMobile, isTablet, isLaptop, width } = useResponsive();
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');

    // Load Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Filter empty strings to avoid sending empty params
            const params: any = {
                ...(searchTerm && { q: searchTerm }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(priceMin && { price_min: priceMin }),
                ...(priceMax && { price_max: priceMax })
            };
            const data = await getSweets(params);
            setSweets(data);
        } catch (error) {
            console.error("Failed to fetch sweets", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchData();
    }, []);

    // Handle Search Submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    // Handle Clear Filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setPriceMin('');
        setPriceMax('');
        setTimeout(() => fetchData(), 0);
    };

    // Handle Purchase
    const handlePurchase = async (id: number) => {
        try {
            await purchaseSweet(id);
            // Optimistic update: Decrement quantity locally to feel instant
            setSweets(prevSweets => 
                prevSweets.map(s => 
                    s.id === id ? { ...s, quantity: s.quantity - 1 } : s
                )
            );
            showSuccess("Purchase successful! Enjoy your treat.");
        } catch (error: any) {
            showError(error.response?.data?.detail || "Purchase failed");
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: isMobile ? '10px' : '20px',
            overflowY: 'auto'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                background: 'white',
                borderRadius: isMobile ? '12px' : '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                padding: isMobile ? '15px' : isTablet ? '20px' : '30px',
                minHeight: isMobile ? 'calc(100vh - 20px)' : 'calc(100vh - 40px)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    marginBottom: isMobile ? '20px' : '30px',
                    paddingBottom: isMobile ? '15px' : '20px',
                    borderBottom: '2px solid #f0f0f0',
                    gap: isMobile ? '15px' : '0'
                }}>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: isMobile ? '1.75rem' : isTablet ? '2rem' : '2.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                        }}>
                            🍬 Sweet Shop
                        </h1>
                        <p style={{ 
                            margin: '5px 0 0 0', 
                            color: '#666', 
                            fontSize: isMobile ? '0.8rem' : '0.9rem' 
                        }}>
                            Your favorite treats, just a click away
                        </p>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: isMobile ? '8px' : '15px',
                        flexWrap: 'wrap',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        {user?.is_admin && (
                            <button 
                                onClick={() => navigate('/admin')} 
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: isMobile ? '8px 12px' : '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    fontSize: isMobile ? '0.85rem' : '1rem',
                                    flex: isMobile ? '1 1 auto' : 'none'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#5a6268';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#6c757d';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                            >
                                ⚙️ Admin Panel
                            </button>
                        )}
                        <span style={{ 
                            color: '#333', 
                            fontWeight: '500',
                            fontSize: isMobile ? '0.85rem' : '1rem',
                            wordBreak: 'break-word'
                        }}>
                            👤 {user?.sub}
                        </span>
                        <button 
                            onClick={logout} 
                            style={{
                                padding: isMobile ? '8px 12px' : '10px 20px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                fontSize: isMobile ? '0.85rem' : '1rem',
                                flex: isMobile ? '1 1 auto' : 'none'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#c82333';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc3545';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} style={{
                    marginBottom: isMobile ? '20px' : '30px',
                    padding: isMobile ? '15px' : '25px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: isMobile ? '10px' : '15px',
                        marginBottom: '15px'
                    }}>
                        <input 
                            type="text" 
                            placeholder="🔍 Search sweets..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        <input 
                            type="text" 
                            placeholder="📁 Category (e.g. Chocolate)" 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        <input 
                            type="number" 
                            placeholder="💰 Min Price" 
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            step="0.01"
                            min="0"
                            style={{
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        <input 
                            type="number" 
                            placeholder="💰 Max Price" 
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            step="0.01"
                            min="0"
                            style={{
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e0e0e0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        gap: '10px',
                        flexDirection: isMobile ? 'column' : 'row'
                    }}>
                        <button 
                            type="submit" 
                            style={{
                                padding: isMobile ? '12px 20px' : '12px 30px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                                width: isMobile ? '100%' : 'auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#5568d3';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#667eea';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
                            }}
                        >
                            🔍 Search
                        </button>
                        <button 
                            type="button"
                            onClick={handleClearFilters}
                            style={{
                                padding: isMobile ? '12px 20px' : '12px 30px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                transition: 'all 0.3s ease',
                                width: isMobile ? '100%' : 'auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#5a6268';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#6c757d';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </form>

                {/* Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '20px',
                            animation: 'spin 1s linear infinite'
                        }}>🍬</div>
                        <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading delicious sweets...</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : isLaptop ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: isMobile ? '15px' : '25px'
                    }}>
                        {sweets.length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '60px 20px',
                                background: '#f8f9fa',
                                borderRadius: '12px'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
                                <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>
                                    No sweets found. Try adjusting your search!
                                </p>
                            </div>
                        ) : (
                            sweets.map(sweet => (
                                <SweetCard 
                                    key={sweet.id} 
                                    sweet={sweet} 
                                    onPurchase={handlePurchase} 
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    );
};

export default Dashboard;