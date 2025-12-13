import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define what the User object looks like (from the Token)
interface User {
    sub: string; // The email is stored in the 'sub' claim
    exp: number;
    is_admin: boolean;
}

// Define the shape of our Context
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback((newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    }, []);

    useEffect(() => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:39',message:'AuthContext mount - checking localStorage',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // Check for token on mount/refresh
        const storedToken = localStorage.getItem('token');
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:43',message:'Token retrieved from localStorage',data:{hasToken:!!storedToken,tokenLength:storedToken?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (storedToken) {
            try {
                const decoded = jwtDecode<User>(storedToken);
                const now = Date.now();
                const expTime = decoded.exp * 1000;
                const isExpired = expTime < now;
                
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:50',message:'Token decoded - checking expiration',data:{exp:decoded.exp,expTime,now,isExpired,timeUntilExp:expTime-now},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
                
                // Check if token is expired
                if (isExpired) {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:55',message:'Token expired - removing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                    // Token expired, remove it
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setHasCheckedAuth(true);
                    setIsLoading(false);
                } else {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:62',message:'Valid token - setting user and token',data:{email:decoded.sub,isAdmin:decoded.is_admin},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
                    // #endregion
                    // Valid token, set user and token
                    setToken(storedToken);
                    setUser(decoded);
                    setHasCheckedAuth(true);
                    // Use a microtask to ensure state updates are processed
                    Promise.resolve().then(() => {
                        // #region agent log
                        fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:78',message:'Setting isLoading to false after user set',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
                        // #endregion
                        setIsLoading(false);
                    });
                }
            } catch (error) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:75',message:'Token decode error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                console.error("Invalid token", error);
                // Invalid token, remove it
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
                setHasCheckedAuth(true);
                setIsLoading(false);
            }
        } else {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:90',message:'No token in localStorage',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            setHasCheckedAuth(true);
            setIsLoading(false);
        }
    }, []); // Only run on mount

    useEffect(() => {
        // Update user when token changes (after login)
        // This effect handles token changes AFTER initial mount (when user logs in)
        // Only run if we've already checked auth initially (to avoid race conditions)
        if (hasCheckedAuth && token) {
            try {
                const decoded = jwtDecode<User>(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                }
            } catch (error) {
                console.error("Invalid token", error);
                logout();
            }
        } else if (hasCheckedAuth && !token) {
            setUser(null);
        }
    }, [token, logout, hasCheckedAuth]);

    // Move logout and login before the useEffect that uses logout

    const isAuthenticated = !!user;
    
    // #region agent log
    React.useEffect(() => {
        fetch('http://127.0.0.1:7243/ingest/5c15c73d-99ef-45bc-ab0d-e880feac44ef',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:95',message:'AuthContext render - current state',data:{hasUser:!!user,hasToken:!!token,isAuthenticated,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }, [user, token, isAuthenticated, isLoading]);
    // #endregion

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook for easy access
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};