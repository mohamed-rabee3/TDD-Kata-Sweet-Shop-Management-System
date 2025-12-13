import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSweets, createSweet, deleteSweet, restockSweet, type Sweet } from '../api/sweets';

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sweets, setSweets] = useState<Sweet[]>([]);
    
    // Form State
    const [newItem, setNewItem] = useState({ name: '', category: '', price: 0, quantity: 0 });

    // 1. Security Check
    useEffect(() => {
        if (user && !user.is_admin) {
            alert("Access Denied: Admins Only");
            navigate('/dashboard');
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        const data = await getSweets();
        setSweets(data);
    };

    // 2. Add Sweet
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSweet(newItem);
            setNewItem({ name: '', category: '', price: 0, quantity: 0 }); // Reset form
            fetchData(); // Refresh list
        } catch (error) {
            alert("Failed to create sweet");
        }
    };

    // 3. Delete Sweet
    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this sweet?")) {
            await deleteSweet(id);
            setSweets(sweets.filter(s => s.id !== id));
        }
    };

    // 4. Restock Sweet
    const handleRestock = async (id: number) => {
        const amountStr = prompt("How many units to add?");
        if (amountStr) {
            const amount = parseInt(amountStr);
            if (!isNaN(amount) && amount > 0) {
                await restockSweet(id, amount);
                fetchData();
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px' }}>← Back to Dashboard</button>
            <h1>Admin Inventory Management</h1>

            {/* Add Form */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '30px', borderRadius: '8px' }}>
                <h3>Add New Sweet</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                    <input placeholder="Category" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} required />
                    <input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} required step="0.01" />
                    <input type="number" placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} required />
                    <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 15px' }}>Add</button>
                </form>
            </div>

            {/* Inventory Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sweets.map(sweet => (
                        <tr key={sweet.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{sweet.id}</td>
                            <td>{sweet.name}</td>
                            <td>{sweet.category}</td>
                            <td>${sweet.price}</td>
                            <td style={{ color: sweet.quantity < 5 ? 'red' : 'black' }}>{sweet.quantity}</td>
                            <td>
                                <button onClick={() => handleRestock(sweet.id)} style={{ marginRight: '5px', cursor: 'pointer' }}>➕ Restock</button>
                                <button onClick={() => handleDelete(sweet.id)} style={{ color: 'red', cursor: 'pointer' }}>🗑 Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;