import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSweets, createSweet, deleteSweet, restockSweet, updateSweet, type Sweet } from '../api/sweets';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useResponsive } from '../hooks/useResponsive';

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast, showSuccess, showError, hideToast } = useToast();
    const { isMobile, isTablet, isLaptop } = useResponsive();
    const [sweets, setSweets] = useState<Sweet[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [newItem, setNewItem] = useState({ name: '', category: '', price: 0, quantity: 0 });
    
    // Edit State
    const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
    const [editForm, setEditForm] = useState({ name: '', category: '', price: 0, quantity: 0 });
    
    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sweet: Sweet | null }>({
        isOpen: false,
        sweet: null
    });
    
    // Restock Modal State
    const [restockModal, setRestockModal] = useState<{ isOpen: boolean; sweet: Sweet | null; amount: string }>({
        isOpen: false,
        sweet: null,
        amount: ''
    });

    // 1. Security Check
    useEffect(() => {
        if (user && !user.is_admin) {
            showError("Access Denied: Admins Only");
            navigate('/dashboard');
        }
        fetchData();
    }, [user, navigate, showError]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getSweets();
            setSweets(data);
        } catch (error) {
            console.error("Failed to fetch sweets", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Add Sweet
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSweet(newItem);
            setNewItem({ name: '', category: '', price: 0, quantity: 0 }); // Reset form
            fetchData(); // Refresh list
            showSuccess("Sweet added successfully!");
        } catch (error) {
            showError("Failed to create sweet");
        }
    };

    // 3. Start Edit
    const handleStartEdit = (sweet: Sweet) => {
        setEditingSweet(sweet);
        setEditForm({
            name: sweet.name,
            category: sweet.category,
            price: sweet.price,
            quantity: sweet.quantity
        });
    };

    // 4. Cancel Edit
    const handleCancelEdit = () => {
        setEditingSweet(null);
        setEditForm({ name: '', category: '', price: 0, quantity: 0 });
    };

    // 5. Save Edit
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSweet) return;
        
        try {
            await updateSweet(editingSweet.id, editForm);
            setEditingSweet(null);
            setEditForm({ name: '', category: '', price: 0, quantity: 0 });
            fetchData();
            showSuccess("Sweet updated successfully!");
        } catch (error) {
            showError("Failed to update sweet");
        }
    };

    // 6. Open Delete Modal
    const handleOpenDelete = (sweet: Sweet) => {
        setDeleteModal({ isOpen: true, sweet });
    };
    
    // 7. Confirm Delete
    const handleConfirmDelete = async () => {
        if (!deleteModal.sweet) return;
        try {
            await deleteSweet(deleteModal.sweet.id);
            setSweets(sweets.filter(s => s.id !== deleteModal.sweet!.id));
            setDeleteModal({ isOpen: false, sweet: null });
            showSuccess("Sweet deleted successfully!");
        } catch (error) {
            showError("Failed to delete sweet");
        }
    };
    
    // 8. Cancel Delete
    const handleCancelDelete = () => {
        setDeleteModal({ isOpen: false, sweet: null });
    };

    // 9. Open Restock Modal
    const handleOpenRestock = (sweet: Sweet) => {
        setRestockModal({ isOpen: true, sweet, amount: '' });
    };
    
    // 10. Confirm Restock
    const handleConfirmRestock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restockModal.sweet) return;
        
        const amount = parseInt(restockModal.amount);
        if (isNaN(amount) || amount <= 0) {
            showError("Please enter a valid positive number");
            return;
        }
        
        try {
            await restockSweet(restockModal.sweet.id, amount);
            setRestockModal({ isOpen: false, sweet: null, amount: '' });
            fetchData();
            showSuccess(`Successfully restocked ${amount} units!`);
        } catch (error) {
            showError("Failed to restock sweet");
        }
    };
    
    // 11. Cancel Restock
    const handleCancelRestock = () => {
        setRestockModal({ isOpen: false, sweet: null, amount: '' });
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
                            fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                        }}>
                            ⚙️ Admin Inventory Management
                        </h1>
                        <p style={{ 
                            margin: '5px 0 0 0', 
                            color: '#666', 
                            fontSize: isMobile ? '0.8rem' : '0.9rem' 
                        }}>
                            Manage your sweet shop inventory
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{
                            padding: isMobile ? '8px 12px' : '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            fontSize: isMobile ? '0.85rem' : '1rem',
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
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Add Form */}
                <div style={{
                    border: '2px solid #e0e0e0',
                    padding: isMobile ? '15px' : '25px',
                    marginBottom: isMobile ? '20px' : '30px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ 
                        marginTop: 0, 
                        marginBottom: '20px', 
                        color: '#333', 
                        fontSize: isMobile ? '1.2rem' : '1.5rem' 
                    }}>
                        ➕ Add New Sweet
                    </h3>
                    <form onSubmit={handleAdd} style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: isMobile ? '10px' : '15px',
                        alignItems: 'end'
                    }}>
                        <input 
                            placeholder="Name" 
                            value={newItem.name} 
                            onChange={e => setNewItem({...newItem, name: e.target.value})} 
                            required
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
                            placeholder="Category" 
                            value={newItem.category} 
                            onChange={e => setNewItem({...newItem, category: e.target.value})} 
                            required
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
                            placeholder="Price" 
                            value={newItem.price || ''} 
                            onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} 
                            required 
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
                            placeholder="Quantity" 
                            value={newItem.quantity || ''} 
                            onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})} 
                            required
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
                        <button 
                            type="submit" 
                            style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: isMobile ? '12px 15px' : '12px 25px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '0.9rem' : '1rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px rgba(40, 167, 69, 0.3)',
                                gridColumn: isMobile ? '1 / -1' : 'auto'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#218838';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(40, 167, 69, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#28a745';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(40, 167, 69, 0.3)';
                            }}
                        >
                            ➕ Add Sweet
                        </button>
                    </form>
                </div>

                {/* Edit Modal */}
                {editingSweet && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: isMobile ? '10px' : '20px'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: isMobile ? '20px' : '30px',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: isMobile ? '95%' : '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            maxHeight: isMobile ? '90vh' : 'auto',
                            overflowY: isMobile ? 'auto' : 'visible'
                        }}>
                            <h2 style={{ 
                                marginTop: 0, 
                                marginBottom: '20px', 
                                color: '#333',
                                fontSize: isMobile ? '1.2rem' : '1.5rem'
                            }}>
                                ✏️ Edit Sweet
                            </h2>
                            <form onSubmit={handleSaveEdit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                    <input 
                                        placeholder="Name" 
                                        value={editForm.name} 
                                        onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                        required
                                        style={{
                                            padding: '12px 15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <input 
                                        placeholder="Category" 
                                        value={editForm.category} 
                                        onChange={e => setEditForm({...editForm, category: e.target.value})} 
                                        required
                                        style={{
                                            padding: '12px 15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Price" 
                                        value={editForm.price || ''} 
                                        onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})} 
                                        required 
                                        step="0.01"
                                        min="0"
                                        style={{
                                            padding: '12px 15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Quantity" 
                                        value={editForm.quantity || ''} 
                                        onChange={e => setEditForm({...editForm, quantity: parseInt(e.target.value) || 0})} 
                                        required
                                        min="0"
                                        style={{
                                            padding: '12px 15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        💾 Save Changes
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleCancelEdit}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.isOpen && deleteModal.sweet && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            padding: isMobile ? '20px' : '30px',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: isMobile ? '95%' : '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            maxHeight: isMobile ? '90vh' : 'auto',
                            overflowY: isMobile ? 'auto' : 'visible'
                        }}>
                            <h2 style={{ 
                                marginTop: 0, 
                                marginBottom: '15px', 
                                color: '#dc3545', 
                                fontSize: isMobile ? '1.2rem' : '1.5rem' 
                            }}>
                                ⚠️ Delete Sweet
                            </h2>
                            <p style={{ marginBottom: '25px', color: '#666', fontSize: '1rem', lineHeight: '1.5' }}>
                                Are you sure you want to delete <strong>"{deleteModal.sweet.name}"</strong>? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={handleConfirmDelete}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s ease'
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
                                    🗑️ Delete
                                </button>
                                <button 
                                    onClick={handleCancelDelete}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s ease'
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
                                    ❌ Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Restock Modal */}
                {restockModal.isOpen && restockModal.sweet && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            padding: isMobile ? '20px' : '30px',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: isMobile ? '95%' : '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            maxHeight: isMobile ? '90vh' : 'auto',
                            overflowY: isMobile ? 'auto' : 'visible'
                        }}>
                            <h2 style={{ 
                                marginTop: 0, 
                                marginBottom: '15px', 
                                color: '#17a2b8', 
                                fontSize: isMobile ? '1.2rem' : '1.5rem' 
                            }}>
                                ➕ Restock Sweet
                            </h2>
                            <p style={{ marginBottom: '20px', color: '#666', fontSize: '1rem', lineHeight: '1.5' }}>
                                How many units would you like to add to <strong>"{restockModal.sweet.name}"</strong>?
                            </p>
                            <p style={{ marginBottom: '20px', color: '#999', fontSize: '0.9rem' }}>
                                Current stock: <strong>{restockModal.sweet.quantity}</strong> units
                            </p>
                            <form onSubmit={handleConfirmRestock}>
                                <div style={{ marginBottom: '20px' }}>
                                    <input 
                                        type="number"
                                        placeholder="Enter amount to add"
                                        value={restockModal.amount}
                                        onChange={e => setRestockModal({...restockModal, amount: e.target.value})}
                                        required
                                        min="1"
                                        step="1"
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = '#17a2b8';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(23, 162, 184, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e0e0e0';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: '#17a2b8',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#138496';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#17a2b8';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        ➕ Restock
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleCancelRestock}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s ease'
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
                                        ❌ Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Inventory Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: isMobile ? '40px 15px' : '60px 20px' }}>
                        <div style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '20px' }}>🍬</div>
                        <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: '#666' }}>Loading inventory...</p>
                    </div>
                ) : (
                    <div style={{
                        overflowX: 'auto',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '600px' : 'auto' }}>
                            <thead>
                                <tr style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}>
                                    <th style={{ 
                                        padding: isMobile ? '10px' : '15px', 
                                        textAlign: 'left', 
                                        fontWeight: '600',
                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                    }}>ID</th>
                                    <th style={{ 
                                        padding: isMobile ? '10px' : '15px', 
                                        textAlign: 'left', 
                                        fontWeight: '600',
                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                    }}>Name</th>
                                    <th style={{ 
                                        padding: isMobile ? '10px' : '15px', 
                                        textAlign: 'left', 
                                        fontWeight: '600',
                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                    }}>Category</th>
                                    <th style={{ 
                                        padding: isMobile ? '10px' : '15px', 
                                        textAlign: 'left', 
                                        fontWeight: '600',
                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                    }}>Price</th>
                                    <th style={{ 
                                        padding: isMobile ? '10px' : '15px', 
                                        textAlign: 'left', 
                                        fontWeight: '600',
                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                    }}>Stock</th>
                                    <th style={{ 
                                        padding: isMobile ? '10px' : '15px', 
                                        textAlign: 'left', 
                                        fontWeight: '600',
                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                    }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sweets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                            No sweets in inventory. Add your first sweet above!
                                        </td>
                                    </tr>
                                ) : (
                                    sweets.map((sweet, index) => (
                                        <tr 
                                            key={sweet.id} 
                                            style={{
                                                borderBottom: '1px solid #eee',
                                                background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                                                transition: 'background 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#e8f0fe';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8f9fa';
                                            }}
                                        >
                                            <td style={{ 
                                                padding: isMobile ? '10px' : '15px', 
                                                fontWeight: '500',
                                                fontSize: isMobile ? '0.85rem' : '1rem'
                                            }}>{sweet.id}</td>
                                            <td style={{ 
                                                padding: isMobile ? '10px' : '15px', 
                                                fontWeight: '500',
                                                fontSize: isMobile ? '0.85rem' : '1rem'
                                            }}>{sweet.name}</td>
                                            <td style={{ 
                                                padding: isMobile ? '10px' : '15px',
                                                fontSize: isMobile ? '0.85rem' : '1rem'
                                            }}>{sweet.category}</td>
                                            <td style={{ 
                                                padding: isMobile ? '10px' : '15px', 
                                                fontWeight: '600', 
                                                color: '#667eea',
                                                fontSize: isMobile ? '0.85rem' : '1rem'
                                            }}>
                                                ${sweet.price.toFixed(2)}
                                            </td>
                                            <td style={{
                                                padding: isMobile ? '10px' : '15px',
                                                color: sweet.quantity < 5 ? '#dc3545' : sweet.quantity < 10 ? '#ffc107' : '#28a745',
                                                fontWeight: '600',
                                                fontSize: isMobile ? '0.85rem' : '1rem'
                                            }}>
                                                {sweet.quantity}
                                            </td>
                                            <td style={{ padding: isMobile ? '10px' : '15px' }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    gap: isMobile ? '4px' : '8px', 
                                                    flexWrap: 'wrap' 
                                                }}>
                                                    <button 
                                                        onClick={() => handleStartEdit(sweet)}
                                                        style={{
                                                            padding: isMobile ? '6px 10px' : '8px 15px',
                                                            backgroundColor: '#667eea',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: isMobile ? '0.75rem' : '0.9rem',
                                                            fontWeight: '500',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#5568d3';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#667eea';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenRestock(sweet)}
                                                        style={{
                                                            padding: isMobile ? '6px 10px' : '8px 15px',
                                                            backgroundColor: '#17a2b8',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: isMobile ? '0.75rem' : '0.9rem',
                                                            fontWeight: '500',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#138496';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#17a2b8';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        ➕ Restock
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenDelete(sweet)}
                                                        style={{
                                                            padding: isMobile ? '6px 10px' : '8px 15px',
                                                            backgroundColor: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: isMobile ? '0.75rem' : '0.9rem',
                                                            fontWeight: '500',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#c82333';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#dc3545';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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

export default AdminPanel;