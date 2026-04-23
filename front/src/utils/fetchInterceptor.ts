import { clearAuthData } from './auth';

/**
 * Wrapper autour de fetch qui gère automatiquement les erreurs 401
 * et redirige vers la page de connexion si le token est invalide
 */
export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const token = localStorage.getItem('token');

    if (token && !options.headers) {
        options.headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    } else if (token && options.headers) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    try {
        const response = await fetch(url, options);

        if (response.status === 401 || response.status === 403) {
            clearAuthData();
            window.location.href = '/auth';
        }

        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Intercepteur global pour fetch qui vérifie les réponses 401/403
 */
export const setupFetchInterceptor = (): void => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        const response = await originalFetch(...args);

        if ((response.status === 401 || response.status === 403) && 
            !args[0].toString().includes('/auth/login') && 
            !args[0].toString().includes('/auth/register')) {
            
            const token = localStorage.getItem('token');
            if (token) {
                clearAuthData();
                window.location.href = '/auth';
            }
        }

        return response;
    };
};
