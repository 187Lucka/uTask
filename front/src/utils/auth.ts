const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Vérifie si le token JWT est valide en faisant une requête au backend
 */
export const verifyToken = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.ok;
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
};

/**
 * Efface les données d'authentification du localStorage
 */
export const clearAuthData = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
};
