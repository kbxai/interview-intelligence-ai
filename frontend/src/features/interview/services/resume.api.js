import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    withCredentials: true,
    timeout: 30000,
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

export async function createResumeJob(interviewId, template) {
    try {
        const response = await api.post(`/api/resume/from-report/${interviewId}`, { template });
        return response.data;
    } catch (error) {
        throw getApiError(error);
    }
}

export async function getResumeJob(jobId) {
    try {
        const response = await api.get(`/api/resume/${jobId}`, { timeout: 10000 });
        return response.data;
    } catch (error) {
        throw getApiError(error);
    }
}

export async function saveResumeSource(jobId, payload) {
    try {
        const response = await api.put(`/api/resume/${jobId}/source`, payload);
        return response.data;
    } catch (error) {
        throw getApiError(error);
    }
}

export async function downloadResume(jobId) {
    try {
        const response = await api.get(`/api/resume/${jobId}/pdf`, { responseType: 'blob' });
        return response.data;
    } catch (error) {
        if (error.response?.data instanceof Blob) {
            const message = await error.response.data.text();
            try {
                const parsed = JSON.parse(message);
                const apiError = new Error(parsed.message || 'PDF download failed');
                apiError.statusCode = error.response.status;
                throw apiError;
            } catch (parseError) {
                if (parseError.statusCode) throw parseError;
            }
        }
        throw getApiError(error);
    }
}
