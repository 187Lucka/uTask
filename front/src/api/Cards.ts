const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateCardResponse {
    success: boolean;
    data: {
        _id: string;
        title: string;
        description: string;
        listId: string;
        dueDate: string;
        priority: number;
        isCompleted: boolean;
    } | null;
    message: string | null;
}

export interface GetListsByListIdResponse {
    success: boolean;
    data: {
        _id: string;
        title: string;
        description: string;
        listId: string;
        dueDate: string;
        priority: number;
        isCompleted: boolean;
    }[] | null;
    message: string | null;
}

export interface RemoveCardResponse {
    success: boolean;
    message: string | null;
}

export async function getCardsByListId(listId: string, token: string): Promise<GetListsByListIdResponse> {
    const response = await fetch(`${API_BASE_URL}/api/cards/list/${listId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    console.log("Get cards by listId response data:", data);
    return data;
}

export async function createCard(title: string, description: string, listId: string, dueDate: string, priority: number, token: string): Promise<CreateCardResponse> {
    console.log('Creating card with:', { title, description, listId, dueDate, priority });

    const response = await fetch(`${API_BASE_URL}/api/cards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, listId, dueDate, priority }),
    });

    const data = await response.json();
    console.log("Create card response data:", data);
    return data;
}

export async function updateCard(listId: string, cardId: string, title: string, description: string, dueDate: string, priority: number, isCompleted: boolean, token: string): Promise<CreateCardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/cards/${cardId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, listId, dueDate, priority, isCompleted }),
    });
    const data = await response.json();
    console.log("Update card response data:", data);
    return data;
}

export async function removeCard(cardId: string, token: string): Promise<RemoveCardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    console.log("Remove card response data:", data);
    return data;
}