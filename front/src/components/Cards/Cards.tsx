import { useState, useRef, useEffect } from "react";
import { FiSettings, FiEdit2, FiTrash2, FiFlag } from "react-icons/fi";

interface CardProps {
    card: {
        id: string;
        title: string;
        description: string;
        dueDate: string;
        priority: number;
        isCompleted: boolean;
    };
    listId: string;
    onUpdateCard: (listId: string, cardId: string, updatedCard: any) => void;
    onDeleteCard: (listId: string, cardId: string) => void;
    isEditing?: boolean;
    onEditingChange?: (isEditing: boolean) => void;
}

const Card = ({ card, listId, onUpdateCard, onDeleteCard, isEditing: externalIsEditing, onEditingChange }: CardProps) => {
    const [internalIsEditing, setInternalIsEditing] = useState(false);
    const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
    const setIsEditing = onEditingChange || setInternalIsEditing;

    const [openMenu, setOpenMenu] = useState(false);
    const [editCard, setEditCard] = useState({
        title: card.title,
        description: card.description,
        dueDate: card.dueDate,
        priority: card.priority,
        isCompleted: card.isCompleted,
    });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(false);
            }
        };

        if (openMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openMenu]);

    const handleSaveEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (editCard.title.trim()) {
            let dueDate = editCard.dueDate ? new Date(editCard.dueDate).toISOString() : "";
            if (dueDate) {
                const parsed = new Date(dueDate);
                dueDate = isNaN(parsed.getTime()) ? "" : parsed.toISOString();
            }
            onUpdateCard(listId, card.id, { ...editCard, dueDate });
            setIsEditing(false);
            setOpenMenu(false);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDeleteCard(listId, card.id);
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenu(!openMenu);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditCard({
            title: card.title,
            description: card.description,
            dueDate: card.dueDate,
            priority: card.priority,
            isCompleted: card.isCompleted,
        });
        setIsEditing(true);
        setOpenMenu(false);
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(false);
        setEditCard({
            title: card.title,
            description: card.description,
            dueDate: card.dueDate,
            priority: card.priority,
            isCompleted: card.isCompleted,
        });
    };

    return (
        <div
            className="bg-white border-2 border-gray-300 rounded-lg p-3 relative hover:shadow-md transition-shadow"
        >
            {isEditing ? (
                <div onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="checkbox"
                            checked={editCard.isCompleted}
                            onChange={(e) =>
                                setEditCard({ ...editCard, isCompleted: e.target.checked })
                            }
                            className="w-4 h-4 accent-blue-600"
                        />
                        <input
                            type="text"
                            value={editCard.title}
                            onChange={(e) => setEditCard({ ...editCard, title: e.target.value })}
                            placeholder="Title..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>

                    <input
                        type="text"
                        value={editCard.description}
                        onChange={(e) => setEditCard({ ...editCard, description: e.target.value })}
                        placeholder="Description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <input
                        type="date"
                        value={editCard.dueDate ? editCard.dueDate.split('T')[0] : ''}
                        onChange={(e) => setEditCard({ ...editCard, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <div className="mb-3">
                        <label className="text-sm font-semibold mr-2 text-gray-700">Priority:</label>
                        <select
                            value={editCard.priority}
                            onChange={(e) =>
                                setEditCard({ ...editCard, priority: parseInt(e.target.value) })
                            }
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={1}>Low</option>
                            <option value={2}>Medium</option>
                            <option value={3}>High</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onMouseDown={handleSaveEdit}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            type="button"
                        >
                            Save
                        </button>
                        <button
                            onMouseDown={handleCancelEdit}
                            className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            type="button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="checkbox"
                                checked={card.isCompleted}
                                onChange={(e) =>
                                    onUpdateCard(listId, card.id, { ...card, isCompleted: e.target.checked })
                                }
                                className="w-4 h-4 accent-blue-600"
                            />
                            <h3
                                className={`text-base font-bold text-blue-600 pr-8 select-none ${card.isCompleted ? "line-through text-gray-400" : ""
                                    }`}
                            >
                                {card.title}
                            </h3>
                        </div>

                        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                            <button
                                onMouseDown={handleMenuClick}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                type="button"
                            >
                                <FiSettings size={14} />
                            </button>

                            {openMenu && (
                                <div className="absolute right-0 mt-1 w-32 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                    <button
                                        onMouseDown={handleEditClick}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-left text-sm"
                                        type="button"
                                    >
                                        <FiEdit2 size={14} />
                                        <span>Edit</span>
                                    </button>
                                    <div className="border-t border-gray-200"></div>
                                    <button
                                        onMouseDown={handleDelete}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-left text-sm text-red-600"
                                        type="button"
                                    >
                                        <FiTrash2 size={14} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 select-none">{card.description}</p>

                    <div className="flex flex-col gap-2 text-xs text-gray-700 select-none">
                            <div className="flex items-center gap-1">
                                <FiFlag
                                    size={14}
                                    className={
                                        card.priority === 3
                                            ? "text-red-500"
                                            : card.priority === 2
                                                ? "text-orange-500"
                                                : "text-green-500"
                                    }
                                />
                                <span className="font-semibold uppercase">
                                    {
                                        card.priority === 3
                                            ? "HIGH"
                                            : card.priority === 2
                                                ? "MEDIUM"
                                                : "LOW"
                                    }
                                </span>
                            </div>

                        {card.dueDate && (
                            <div className="font-semibold">{card.dueDate.split('T')[0]}</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Card;