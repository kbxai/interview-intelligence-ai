import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
})

function getApiError(error) {
    const apiError = new Error(error.response?.data?.message ?? error.message ?? 'Request failed')
    apiError.statusCode = error.response?.status
    return apiError
}

export async function register(username, email, password) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data
    } catch (error) {
        throw getApiError(error)
    }

}

export async function login(email, password) {
    try {
        const response = await api.post('/api/auth/login', {
            email, password
        })
        return response.data
    }
    catch (error) {
        throw getApiError(error)
    }
}

export async function logout() {
    try {
        const response = await api.post('/api/auth/logout')
        return response.data
    }
    catch (error) {
        throw getApiError(error)
    }
}

export async function getMe(){
    try{
        const response = await api.get('/api/auth/get-me')
        return response.data
    }
    catch(error){
        throw getApiError(error)
    }
}