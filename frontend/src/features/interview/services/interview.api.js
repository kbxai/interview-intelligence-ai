import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function getApiError(error) {
    const apiError = new Error(error.response?.data?.message ?? error.message ?? 'Request failed');
    apiError.statusCode = error.response?.status;
    return apiError;
}

export async function getInterviewReport(interviewId) {
    try {
        const response = await api.get(`/api/interview/${interviewId}`);
        return response.data;
    } catch (error) {
        throw getApiError(error);
    }
}

export async function getInterviewReports() {
    try {
        const response = await api.get('/api/interview?limit=50');
        return response.data;
    } catch (error) {
        throw getApiError(error);
    }
}

export async function generateInterviewReport(formData) {
    try {
        const response = await api.post('/api/interview', formData);
        return response.data;
    } catch (error) {
        throw getApiError(error);
    }
}
