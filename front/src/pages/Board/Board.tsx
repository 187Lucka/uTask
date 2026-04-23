import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSettings } from 'react-icons/fi';
import { getBoardsByUserId, createBoard, updateBoard, deleteBoard } from '../../api/Board';

function Board() {
    const [boards, setBoards] = useState<{ id: string; title: string, description: string }[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [errors, setErrors] = useState({ title: '', description: '' });
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/auth");
        return null;
    }

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;

                const response = await getBoardsByUserId(userId, token);
                console.log('Boards récupérés :', response);
                if (response.success && response.data) {
                    setBoards(response.data.map(board => ({
                        id: board._id,
                        title: board.name,
                        description: board.description || '',
                    })));
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des boards :', error);
            }
        };

        fetchBoards();
    }, []);

    const validateBoard = (title: string): boolean => {
        const newErrors = { title: '', description: '' };
        let isValid = true;

        if (!title.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCreateBoard = async () => {
        if (!validateBoard(newBoardTitle)) return;

        try {
            const userId = localStorage.getItem('userId');
            console.log("Creating board for userId: ", userId);
            if (!userId) return;

            const response = await createBoard(newBoardTitle, newBoardDescription, userId, token);
            if (response.success && response.data) {
                const newBoard = {
                    id: response.data._id,
                    title: response.data.name,
                    description: response.data.description || '',
                };
                setBoards([...boards, newBoard]);
                setNewBoardTitle('');
                setNewBoardDescription('');
                setIsCreating(false);
                setErrors({ title: '', description: '' });
            }
        } catch (error) {
            console.error('Erreur lors de la création du board :', error);
        }
    };

    const handleSaveEdit = async (id: string) => {
        if (!validateBoard(editTitle)) return;
        
        try {
            const response = await updateBoard(id, editTitle, editDescription, token);
            if (response.success && response.data) {
                setBoards(boards.map(board =>
                    board.id === id
                        ? {
                            ...board,
                            title: response.data ? response.data.name || '' : board.title,
                            description: response.data ? response.data.description || '' : board.description,
                        }
                        : board
                ));
                setEditingId(null);
                setEditTitle('');
                setEditDescription('');
                setErrors({ title: '', description: '' });
            } else {
                console.error('Response data is null or update failed.');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du board :', error);
        }
    };

    const handleDelete = async (id : string) => {
        try {
            const response = await deleteBoard(id, token);
            if (response.success) {
                setBoards(boards.filter(board => board.id !== id));
                setOpenMenuId(null);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du board :', error);
        }
    };

    const handleBoardClick = (board: any) => {
        navigate(`/boards/${board.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Welcome Title */}
                <div className="flex flex-col items-center mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-3">Welcome</h2>
                    <div className="w-48 sm:w-64 h-1 bg-blue-600"></div>
                </div>
                {/* Boards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto">
                    {boards.map((board) => (
                        <div
                            key={board.id}
                            className={`relative bg-white border-2 border-gray-300 rounded-xl p-3 sm:p-4 min-h-32 flex flex-col ${
                                editingId === board.id ? '' : 'cursor-pointer hover:shadow-md transition-shadow items-center justify-center'
                            }`}
                            onClick={editingId === board.id ? undefined : () => handleBoardClick(board)}
                        >
                            {editingId === board.id ? (
                                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => {
                                            setEditTitle(e.target.value);
                                            if (errors.title) setErrors({ ...errors, title: '' });
                                        }}
                                        placeholder="Board name..."
                                        className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg font-bold mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        autoFocus
                                    />
                                    {errors.title && <p className="text-xs text-red-500 mb-2">{errors.title}</p>}
                                    
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Description..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveEdit(board.id)}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditTitle('');
                                                setEditDescription('');
                                                setErrors({ title: '', description: '' });
                                            }}
                                            className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg sm:text-xl font-semibold text-blue-600 text-center">
                                        {board.title}
                                    </h3>
                                    {board.description && (
                                        <p className="text-xs sm:text-sm text-gray-600 text-center mt-2 line-clamp-2">
                                            {board.description}
                                        </p>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === board.id ? null : board.id);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            <FiSettings size={14} />
                                        </button>
                                        {openMenuId === board.id && (
                                            <div className="absolute right-0 mt-1 w-32 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingId(board.id);
                                                        setEditTitle(board.title);
                                                        setEditDescription(board.description);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-left text-sm"
                                                >
                                                    <FiEdit2 size={14} />
                                                    <span>Edit</span>
                                                </button>
                                                <div className="border-t border-gray-200"></div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(board.id);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-left text-sm text-red-600"
                                                >
                                                    <FiTrash2 size={14} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Create New Board */}
                    {isCreating ? (
                        <div className="bg-white border-2 border-gray-300 rounded-xl p-3 sm:p-4 min-h-32 flex flex-col">
                            <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={newBoardTitle}
                                onChange={(e) => {
                                    setNewBoardTitle(e.target.value);
                                    if (errors.title) setErrors({ ...errors, title: '' });
                                }}
                                placeholder="Board name..."
                                className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg font-bold mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                autoFocus
                            />
                            {errors.title && <p className="text-xs text-red-500 mb-2">{errors.title}</p>}
                            
                            <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
                            <textarea
                                value={newBoardDescription}
                                onChange={(e) => setNewBoardDescription(e.target.value)}
                                placeholder="Description..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateBoard}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewBoardTitle('');
                                        setNewBoardDescription('');
                                        setErrors({ title: '', description: '' });
                                    }}
                                    className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-white border-2 border-gray-300 rounded-xl p-3 sm:p-4 min-h-32 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        >
                            <FiPlus size={32} className="sm:w-10 sm:h-10 text-blue-400 group-hover:text-blue-600 transition-colors" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Board;