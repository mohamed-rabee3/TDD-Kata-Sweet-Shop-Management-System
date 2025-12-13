import api from './axios';

export const loginUser = async (credentials: URLSearchParams) => {
    // OAuth2 expects form-urlencoded data, not JSON
    const response = await api.post('/api/auth/login', credentials, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
};

export const registerUser = async (userData: object) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
};