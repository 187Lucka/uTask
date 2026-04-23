const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RegisterData {
    success: boolean;
    data: {
        _id: string;
        username: string;
        token: string;
    } | null;
    message: string | null;
    errors?: { message: string }[];
}

export async function register(username: string, password: string): Promise<RegisterData> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    console.log("Register response data: ", data);
    return data;
}

export interface LoginData {
    success: boolean;
    data: {
        _id: string;
        username: string;
        token: string;
    } | null;
    message: string | null;
    errors?: { message: string }[];
}

export async function login(username: string, password: string): Promise<LoginData> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    console.log("Login response data: ", data);
    return data;
}