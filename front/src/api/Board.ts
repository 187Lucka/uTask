const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateBoardResponse {
    success: boolean;
    data: {
        _id: string;
        name: string;
        description?: string;
        userId: string;
    } | null;
    message: string | null;
}

export interface GetBoardsByUserResponse {
    success: boolean;
    data: {
        _id: string;
        name: string;
        description?: string;
        userId: string;
    }[] | null;
    message: string | null;
}

export interface RemoveBoardResponse {
    success: boolean;
    message: string | null;
}

export async function getBoardsByUserId(userId: string, token: string): Promise<GetBoardsByUserResponse> {
    const response = await fetch(`${API_BASE_URL}/api/boards/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    return data;
}

export async function createBoard(name: string, description: string, userId: string, token: string): Promise<CreateBoardResponse> {
    console.log("Create board with data : ", { name, description, userId });
    const response = await fetch(`${API_BASE_URL}/api/boards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, userId }),
    });
    const data = await response.json();
    console.log("Create board response data: ", data);
    return data;
}

export async function updateBoard(boardId: string, name: string, description: string, token: string): Promise<CreateBoardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description }),
    });
    const data = await response.json();
    return data;
}

export async function deleteBoard(boardId: string, token: string): Promise<RemoveBoardResponse> {
    const response = await fetch(`${API_BASE_URL}/api/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();
    return data;
}