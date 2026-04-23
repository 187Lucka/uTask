import { useState, useRef, useEffect } from "react";
import { FiSettings, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { defaultScreenReaderInstructions, useDroppable } from "@dnd-kit/core";
import Card from "../Cards/Cards";
import DragAndDrop from "../DragAndDrop/DragAndDrop";

interface ListProps {
    list: { id: string; title: string; cards: any[] };
    onUpdateList: (listId: string, newTitle: string) => void;
    onDeleteList: (listId: string) => void;
    onUpdateCard: (listId: string, cardId: string, updatedCard: any) => void;
    onDeleteCard: (listId: string, cardId: string) => void;
    onAddCard: (listId: string, card: any) => void;
}

const List = ({ list, onUpdateList, onDeleteList, onUpdateCard, onDeleteCard, onAddCard }: ListProps) => {
    const [openMenu, setOpenMenu] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(list.title);
    const [titleError, setTitleError] = useState("");
    const [newCard, setNewCard] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: 1,
        isCompleted: false
    });
    const [cardErrors, setCardErrors] = useState({ title: '', description: '', dueDate: '' });
    const [showNewCardForm, setShowNewCardForm] = useState(false);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const { setNodeRef: setDropZoneRef, isOver } = useDroppable({
        id: `dropzone-${list.id}`,
    });

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

    const validateTitle = (title: string): boolean => {
        if (!title.trim()) {
            setTitleError("Title is required");
            return false;
        }
        setTitleError("");
        return true;
    };

    const validateCard = (title: string, description: string, dueDate: string): boolean => {
        const errors = { title: '', description: '', dueDate: '' };
        let isValid = true;

        if (!title.trim()) {
            errors.title = 'Title is required';
            isValid = false;
        }

        if (!description.trim()) {
            errors.description = 'Description is required';
            isValid = false;
        }

        if (!dueDate.trim()) {
            errors.dueDate = 'Due date is required';
            isValid = false;
        }

        setCardErrors(errors);
        return isValid;
    };

    const handleAddCard = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!validateCard(newCard.title, newCard.description, newCard.dueDate)) {
            return;
        }

        if (newCard.title.trim() && newCard.description.trim() && newCard.dueDate.trim()) {
            onAddCard(list.id, newCard);

            setNewCard({
                title: "",
                description: "",
                dueDate: "",
                priority: 1,
                isCompleted: false
            });
            setCardErrors({ title: '', description: '', dueDate: '' });
            setShowNewCardForm(false);
        }
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOpenMenu(!openMenu);
    };

    const handleRenameClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditingTitle(true);
        setEditTitle(list.title);
        setTitleError("");
        setOpenMenu(false);
    };

    const handleSaveTitle = () => {
        if (!validateTitle(editTitle)) {
            return;
        }
        
        if (editTitle.trim() && editTitle !== list.title) {
            onUpdateList(list.id, editTitle);
        }
        setIsEditingTitle(false);
        setTitleError("");
    };

    const handleCancelEdit = () => {
        setEditTitle(list.title);
        setIsEditingTitle(false);
        setTitleError("");
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDeleteList(list.id);
        setOpenMenu(false);
    };

    return (
        <div className="bg-white border-2 border-gray-300 rounded-xl p-4 w-64 flex-shrink-0 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-start mb-4">
                {isEditingTitle ? (
                    <div className="flex-1 mr-2">
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => {
                                setEditTitle(e.target.value);
                                if (titleError) setTitleError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSaveTitle();
                                } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                }
                            }}
                            placeholder="List title..."
                            className={`w-full px-3 py-2 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            autoFocus
                        />
                        {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleSaveTitle}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-blue-600 select-none">{list.title}</h2>
                        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                            <button
                                onMouseDown={handleMenuClick}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                type="button"
                            >
                                <FiSettings size={16} />
                            </button>

                            {openMenu && (
                                <div className="absolute right-0 mt-1 w-32 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                    <button
                                        onMouseDown={handleRenameClick}
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
                    </>
                )}
            </div>

            <div className="flex flex-col gap-3 flex-1">
                {list.cards.length === 0 && !showNewCardForm && (
                    <div
                        ref={setDropZoneRef}
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex items-center justify-center min-h-[100px] ${isOver
                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                : 'border-gray-300 text-gray-400'
                            }`}
                    >
                        {isOver ? 'Drop here!' : 'Drop cards here'}
                    </div>
                )}

                {list.cards.map((card) => (
                    <DragAndDrop
                        key={card.id}
                        id={`card-${list.id}_${card.id}`}
                        disabled={editingCardId === card.id}
                    >
                        <Card
                            card={card}
                            listId={list.id}
                            onUpdateCard={onUpdateCard}
                            onDeleteCard={onDeleteCard}
                            isEditing={editingCardId === card.id}
                            onEditingChange={(isEditing) => setEditingCardId(isEditing ? card.id : null)}
                        />
                    </DragAndDrop>
                ))}

                {showNewCardForm ? (
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={newCard.isCompleted}
                                onChange={(e) =>
                                    setNewCard({ ...newCard, isCompleted: e.target.checked })
                                }
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-4 h-4 accent-blue-600"
                            />
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCard.title}
                                    onChange={(e) => {
                                        setNewCard({ ...newCard, title: e.target.value });
                                        if (cardErrors.title) setCardErrors({ ...cardErrors, title: '' });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleAddCard(e as any);
                                        } else if (e.key === "Escape") {
                                            setShowNewCardForm(false);
                                            setCardErrors({ title: '', description: '', dueDate: '' });
                                        }
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder="Card title..."
                                    className={`w-full px-3 py-2 border ${cardErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    autoFocus
                                />
                                {cardErrors.title && <p className="text-xs text-red-500 mt-1">{cardErrors.title}</p>}
                            </div>
                        </div>

                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Description<span className="text-red-500"> *</span></label>
                        <textarea
                            value={newCard.description}
                            onChange={(e) => {
                                setNewCard({ ...newCard, description: e.target.value });
                                if (cardErrors.description) setCardErrors({ ...cardErrors, description: '' });
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            placeholder="Description..."
                            className={`w-full px-3 py-2 border ${
                                cardErrors.description ? "border-red-500" : "border-gray-300"
                            } rounded-lg mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            rows={2}
                        />
                        {cardErrors.description && (
                            <p className="text-xs text-red-500 mb-2">{cardErrors.description}</p>
                        )}

                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={newCard.dueDate}
                            onChange={(e) => {
                                setNewCard({ ...newCard, dueDate: e.target.value });
                                if (cardErrors.dueDate) setCardErrors({ ...cardErrors, dueDate: '' });
                            }}
                            max="2099-12-31"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`w-full px-3 py-2 border ${cardErrors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-lg mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {cardErrors.dueDate && <p className="text-xs text-red-500 mb-2">{cardErrors.dueDate}</p>}

                        <div className="mb-3">
                            <label className="text-sm font-semibold mr-2 text-gray-700">Priority:</label>
                            <select
                                value={newCard.priority}
                                onChange={(e) =>
                                    setNewCard({ ...newCard, priority: parseInt(e.target.value) })
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
                                onMouseDown={handleAddCard}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                type="button"
                            >
                                Add
                            </button>
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowNewCardForm(false);
                                    setCardErrors({ title: '', description: '', dueDate: '' });
                                }}
                                className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowNewCardForm(true);
                        }}
                        className="w-full flex items-center justify-center py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        type="button"
                    >
                        <FiPlus size={24} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default List;