const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateListsResponse {
    success: boolean;
    data: {
        _id: string;
        name: string;
        boardId: string;
    } | null;
    message: string | null;
}

export interface GetListsByBoardIdResponse {
    success: boolean;
    data: {
        _id: string;
        name: string;
        boardId: string;
    }[] | null;
    message: string | null;
}

export interface RemoveListResponse {
    success: boolean;
    message: string | null;
}

export async function getListsByBoardId(boardId: string, token: string): Promise<GetListsByBoardIdResponse> {
    const response = await fetch(`${API_BASE_URL}/api/lists/board/${boardId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    return data;
}

export async function createList(name: string, boardId: string, token: string): Promise<CreateListsResponse> {
    console.log("Creating list with name:", name, "for boardId:", boardId);
    const response = await fetch(`${API_BASE_URL}/api/lists`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, boardId }),
    });
    const data = await response.json();
    return data;
}

export async function updateList(boardId: string, listId: string, name: string, token: string): Promise<CreateListsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, boardId }),
    });
    const data = await response.json();
    return data;
}

export async function removeList(listId: string, token: string): Promise<RemoveListResponse> {
    const response = await fetch(`${API_BASE_URL}/api/lists/${listId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    return data;
}