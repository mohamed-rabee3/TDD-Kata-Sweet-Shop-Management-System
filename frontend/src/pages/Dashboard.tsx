import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSweets, purchaseSweet, type Sweet } from '../api/sweets';
import SweetCard from '../components/SweetCard';

const Dashboard: React.FC = () => {
    const { logout, user } = useAuth();
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Load Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Filter empty strings to avoid sending empty params
            const params = {
                ...(searchTerm && { q: searchTerm }),
                ...(categoryFilter && { category: categoryFilter })
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
            alert("Purchase successful! Enjoy your treat.");
        } catch (error: any) {
            alert(error.response?.data?.detail || "Purchase failed");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Sweet Shop 🍬</h1>
                <div>
                    <span>Welcome, {user?.sub}</span>
                    <button onClick={logout} style={{ marginLeft: '15px', padding: '5px 10px' }}>Logout</button>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <input 
                    type="text" 
                    placeholder="Search sweets..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', marginRight: '10px' }}
                />
                <input 
                    type="text" 
                    placeholder="Category (e.g. Chocolate)" 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ padding: '8px', marginRight: '10px' }}
                />
                <button type="submit" style={{ padding: '8px 16px' }}>Filter</button>
            </form>

            {/* Grid */}
            {loading ? (
                <p>Loading sweets...</p>
            ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {sweets.length === 0 ? (
                        <p>No sweets found. Try adjusting your search!</p>
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
    );
};

export default Dashboard;