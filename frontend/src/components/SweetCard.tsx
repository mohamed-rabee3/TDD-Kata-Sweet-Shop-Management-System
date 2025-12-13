import React from 'react';
import type { Sweet } from '../api/sweets';

interface SweetCardProps {
    sweet: Sweet;
    onPurchase: (id: number) => void;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onPurchase }) => {
    const isOutOfStock = sweet.quantity <= 0;

    return (
        <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            margin: '10px',
            width: '250px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h3>{sweet.name}</h3>
            <p><strong>Category:</strong> {sweet.category}</p>
            <p><strong>Price:</strong> ${sweet.price.toFixed(2)}</p>
            <p style={{ color: isOutOfStock ? 'red' : 'green' }}>
                <strong>Stock:</strong> {sweet.quantity}
            </p>
            
            <button 
                onClick={() => onPurchase(sweet.id)}
                disabled={isOutOfStock}
                style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: isOutOfStock ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                }}
            >
                {isOutOfStock ? 'Out of Stock' : 'Purchase'}
            </button>
        </div>
    );
};

export default SweetCard;