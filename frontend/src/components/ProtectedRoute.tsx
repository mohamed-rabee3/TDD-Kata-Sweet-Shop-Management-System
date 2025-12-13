import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // #region agent log
    React.useEffect(() => {
        fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:6',message:'ProtectedRoute render - auth check',data:{isAuthenticated,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }, [isAuthenticated, isLoading]);
    // #endregion

    // Show loading state while checking authentication
    if (isLoading) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:12',message:'Showing loading state',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
                justifyContent: 'center'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🍬</div>
                    <p style={{ fontSize: '1.2rem' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:35',message:'Redirecting to login - not authenticated',data:{isAuthenticated,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return <Navigate to="/login" replace />;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:40',message:'Rendering protected content',data:{isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    return <Outlet />;
};

export default ProtectedRoute;