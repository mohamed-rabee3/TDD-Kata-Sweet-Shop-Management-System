import React from 'react';
import type { Sweet } from '../api/sweets';

interface SweetCardProps {
    sweet: Sweet;
    onPurchase: (id: number) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onPurchase }) => {
    const isOutOfStock = sweet.quantity <= 0;
    const isLowStock = sweet.quantity > 0 && sweet.quantity < 5;

    return (
        <div style={{
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px',
            background: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#667eea';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = '#e0e0e0';
        }}
        >
            {/* Stock Badge */}
            <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: isOutOfStock ? '#dc3545' : isLowStock ? '#ffc107' : '#28a745',
                color: 'white'
            }}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
            </div>

            {/* Sweet Icon */}
            <div style={{
                fontSize: '3rem',
                textAlign: 'center',
                marginBottom: '15px',
                marginTop: '10px'
            }}>
                🍬
            </div>

            <h3 style={{
                margin: '0 0 10px 0',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#333',
                textAlign: 'center'
            }}>
                {sweet.name}
            </h3>

            <div style={{
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '15px'
            }}>
                <p style={{ margin: '8px 0', color: '#666', fontSize: '0.9rem' }}>
                    <strong style={{ color: '#333' }}>📁 Category:</strong> {sweet.category}
                </p>
                <p style={{ margin: '8px 0', color: '#666', fontSize: '0.9rem' }}>
                    <strong style={{ color: '#333' }}>💰 Price:</strong> 
                    <span style={{ 
                        color: '#667eea', 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        marginLeft: '5px'
                    }}>
                        ${sweet.price.toFixed(2)}
                    </span>
                </p>
                <p style={{ 
                    margin: '8px 0', 
                    fontSize: '0.9rem',
                    color: isOutOfStock ? '#dc3545' : isLowStock ? '#ffc107' : '#28a745',
                    fontWeight: '600'
                }}>
                    <strong>📦 Stock:</strong> {sweet.quantity} units
                </p>
            </div>
            
            <button 
                onClick={() => onPurchase(sweet.id)}
                disabled={isOutOfStock}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isOutOfStock ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: isOutOfStock ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                    if (!isOutOfStock) {
                        e.currentTarget.style.backgroundColor = '#5568d3';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOutOfStock) {
                        e.currentTarget.style.backgroundColor = '#667eea';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
                    }
                }}
            >
                {isOutOfStock ? '❌ Out of Stock' : '🛒 Purchase Now'}
            </button>
        </div>
    );
};

export default SweetCard;