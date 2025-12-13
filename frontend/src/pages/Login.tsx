import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Prepare data as URLSearchParams (standard for OAuth2)
            const params = new URLSearchParams();
            params.append('username', email); // API expects 'username' field
            params.append('password', password);

            const data = await loginUser(params);
            
            // 1. Save token in Context
            login(data.access_token);
            
            // 2. Redirect to Dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
        }}>
            <div style={{
                maxWidth: '450px',
                width: '100%',
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🍬</div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold'
                    }}>
                        Welcome Back!
                    </h2>
                    <p style={{ color: '#666', marginTop: '10px' }}>Sign in to your Sweet Shop account</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fee',
                        border: '2px solid #dc3545',
                        borderRadius: '8px',
                        color: '#dc3545',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontWeight: '500'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#333',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            📧 Email Address
                        </label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your email"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                boxSizing: 'border-box'
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
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#333',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}>
                            🔒 Password
                        </label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                boxSizing: 'border-box'
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
                    <button 
                        type="submit" 
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                            marginBottom: '20px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#5568d3';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#667eea';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                         Login
                    </button>
                </form>
                <p style={{ textAlign: 'center', color: '#666', margin: 0 }}>
                    Don't have an account?{' '}
                    <Link 
                        to="/register" 
                        style={{
                            color: '#667eea',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;