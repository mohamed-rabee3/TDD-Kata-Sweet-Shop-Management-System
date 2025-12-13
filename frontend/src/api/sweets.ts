import api from './axios';

export interface Sweet {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    image_url?: string;
}

export interface SearchParams {
    q?: string;
    category?: string;
    price_max?: string;
}

// Fetch all sweets (supports optional filtering)
export const getSweets = async (params: SearchParams = {}) => {
    // If we have filters, use the /search endpoint, otherwise use /
    const endpoint = Object.keys(params).length > 0 ? '/sweets/search' : '/sweets';
    
    const response = await api.get<Sweet[]>(endpoint, { params });
    return response.data;
};

// Purchase a sweet
export const purchaseSweet = async (id: number) => {
    const response = await api.post(`/sweets/${id}/purchase`);
    return response.data;
};

export const createSweet = async (data: Omit<Sweet, 'id'>) => {
    const response = await api.post('/sweets/', data);
    return response.data;
};

export const deleteSweet = async (id: number) => {
    await api.delete(`/sweets/${id}`);
};

export const restockSweet = async (id: number, amount: number) => {
    const response = await api.post(`/sweets/${id}/restock`, { amount });
    return response.data;
};