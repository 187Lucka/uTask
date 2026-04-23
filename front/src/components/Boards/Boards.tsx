import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FiPlus, FiFilter } from "react-icons/fi";
import DragAndDrop from "../DragAndDrop/DragAndDrop";
import List from "../List/List";
import { getListsByBoardId, createList, updateList, removeList } from "../../api/Lists";
import { getCardsByListId, createCard, updateCard, removeCard } from "../../api/Cards";

function Boards() {
    const navigate = useNavigate();
    const { id: boardId } = useParams();

    const [lists, setLists] = useState<any[]>([]);
    const [filteredLists, setFilteredLists] = useState<any[]>([]);
    const [showNewListForm, setShowNewListForm] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [newListError, setNewListError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        priority: 'all',
        dateSort: 'none'
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
        })
    );

    // check localStorage for token
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/auth");
        return null;
    }

    useEffect(() => {
        const fetchListsAndCards = async () => {
            if (!boardId) return;

            try {
                const response = await getListsByBoardId(boardId, token);

                // Vérifier si le token est invalide ou expiré
                if (!response.success && response.message === 'Invalid or expired token') {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    navigate("/auth");
                    return;
                }

                if (response.success && response.data) {
                    const listsWithCards = await Promise.all(
                        response.data.map(async (list) => {
                            const cardsRes = await getCardsByListId(list._id, token);
                            return {
                                id: list._id,
                                title: list.name,
                                cards: cardsRes.success && cardsRes.data
                                    ? cardsRes.data.map(card => ({
                                        id: card._id,
                                        title: card.title,
                                        description: card.description,
                                        dueDate: card.dueDate,
                                        priority: card.priority,
                                        isCompleted: card.isCompleted,
                                    }))
                                    : [],
                            };
                        })
                    );
                    setLists(listsWithCards);
                    setFilteredLists(listsWithCards);
                }
            } catch (error) {
                console.error("Error fetching lists:", error);
            }
        };
        fetchListsAndCards();
    }, [boardId, token, navigate]);

    useEffect(() => {
        applyFilters();
    }, [filters, lists]);

    const applyFilters = () => {
        let filtered = lists.map(list => {
            let filteredCards = [...list.cards];

            // Filter by priority
            if (filters.priority !== 'all') {
                const priorityLevel = parseInt(filters.priority);
                filteredCards = filteredCards.filter(card => card.priority === priorityLevel);
            }

            // Sort by date
            if (filters.dateSort === 'asc') {
                filteredCards.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                });
            } else if (filters.dateSort === 'desc') {
                filteredCards.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                });
            }

            return { ...list, cards: filteredCards };
        });

        setFilteredLists(filtered);
    };

    const validateListTitle = (title: string): boolean => {
        if (!title.trim()) {
            setNewListError("Title is required");
            return false;
        }
        setNewListError("");
        return true;
    };

    const handleAddList = async () => {
        if (!validateListTitle(newListTitle)) return;

        if (newListTitle.trim() && boardId) {
            try {
                const response = await createList(newListTitle, boardId, token);

                // Vérifier si le token est invalide ou expiré
                if (!response.success && response.message === 'Invalid or expired token') {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    navigate("/auth");
                    return;
                }

                if (response.success && response.data) {
                    const newList = {
                        id: response.data._id,
                        title: response.data.name,
                        cards: [],
                    };
                    setLists([...lists, newList]);
                    setNewListTitle("");
                    setNewListError("");
                    setShowNewListForm(false);
                }
            } catch (error) {
                console.error("Error adding list:", error);
            }
        }
    };

    const handleAddCard = async (listId: string, card: any) => {
        let dueDate: string = "";

        if (card.dueDate) {
            if (card.dueDate.includes('T')) {
                dueDate = card.dueDate;
            } 
            else if (card.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const parsed = new Date(`${card.dueDate}T23:59:59.000Z`);
                dueDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : "";
            }
            else if (card.dueDate.includes("/")) {
                const [day, month, year] = card.dueDate.split("/");
                const fullYear = year.length === 2 ? `20${year}` : year;
                const parsed = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59.000Z`);
                dueDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : "";
            }
        }

        const response = await createCard(
            card.title,
            card.description || "",
            listId,
            dueDate,
            card.priority || 1,
            token
        );

        if (response.success && response.data) {
            const newCard = {
                id: response.data._id,
                title: response.data.title,
                description: response.data.description,
                dueDate: response.data.dueDate,
                priority: response.data.priority,
                isCompleted: response.data.isCompleted,
            };
            setLists((prev) =>
                prev.map((list) =>
                    list.id === listId
                        ? { ...list, cards: [...list.cards, newCard] }
                        : list
                )
            );
        }
    };

    const handleUpdateCard = async (listId: string, cardId: string, updatedCard: any) => {
        let dueDate = "";

        if (updatedCard.dueDate) {
            if (updatedCard.dueDate.includes('T')) {
                dueDate = updatedCard.dueDate;
            }
            else if (updatedCard.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const parsed = new Date(`${updatedCard.dueDate}T23:59:59.000Z`);
                dueDate = !isNaN(parsed.getTime()) ? parsed.toISOString() : "";
            }
            else {
                const parsed = new Date(updatedCard.dueDate);
                dueDate = isNaN(parsed.getTime()) ? "" : parsed.toISOString();
            }
        }

        const response = await updateCard(
            listId,
            cardId,
            updatedCard.title,
            updatedCard.description || "",
            dueDate,
            updatedCard.priority || 1,
            updatedCard.isCompleted,
            token
        );
        if (response.success && response.data) {
            setLists((prev) =>
                prev.map((list) =>
                    list.id === listId
                        ? { ...list, cards: list.cards.map((c : any) => (c.id === cardId ? { ...c, ...updatedCard } : c)) }
                        : list
                )
            );
        }
    };

    const handleDeleteCard = async (listId: string, cardId: string) => {
        const response = await removeCard(cardId, token);
        if (response.success) {
            setLists((prev) =>
                prev.map((list) =>
                    list.id === listId
                        ? { ...list, cards: list.cards.filter((c: any) => c.id !== cardId) }
                        : list
                )
            );
        }
    };

    const handleDeleteList = async (listId: string) => {
        const response = await removeList(listId, token);
        if (response.success) {
            setLists(lists.filter(l => l.id !== listId));
        }
    };

    const handleUpdateList = async (listId: string, newTitle: string) => {
        if (newTitle.trim() && boardId) {
            const response = await updateList(boardId, listId, newTitle, token);
            if (response.success && response.data) {
                const updatedName = response.data?.name ?? newTitle;
                setLists(lists.map(l =>
                    l.id === listId ? { ...l, title: updatedName } : l
                ));
            }
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        
        if (!over || active.id === over.id) return;

        const activeIdStr = active.id.toString();
        const overIdStr = over.id.toString();

        // Handle list reordering
        if (activeIdStr.startsWith("list-") && overIdStr.startsWith("list-")) {
            const oldIndex = lists.findIndex((l) => "list-" + l.id === activeIdStr);
            const newIndex = lists.findIndex((l) => "list-" + l.id === overIdStr);
            if (oldIndex !== -1 && newIndex !== -1) {
                setLists(arrayMove(lists, oldIndex, newIndex));
            }
            return;
        }

        if (activeIdStr.startsWith("card-")) {
            const [activeListId, activeCardId] = activeIdStr.replace("card-", "").split("_");

            const sourceList = lists.find((l) => l.id === activeListId);
            if (!sourceList) return;

            const movedCard = sourceList.cards.find((c : any) => c.id === activeCardId);
            if (!movedCard) return;

            if (overIdStr.startsWith("dropzone-")) {
                const targetListId = overIdStr.replace("dropzone-", "");
                
                if (targetListId === activeListId) return; // Same list, no change
                
                setLists((prev) => 
                    prev.map((l) => {
                        if (l.id === activeListId) {
                            return { ...l, cards: l.cards.filter((c : any) => c.id !== activeCardId) };
                        }
                        if (l.id === targetListId) {
                            return { ...l, cards: [...l.cards, movedCard] };
                        }
                        return l;
                    })
                );

                try {
                    await removeCard(activeCardId, token);
                    await createCard(
                        movedCard.title,
                        movedCard.description || "",
                        targetListId,
                        movedCard.dueDate || "",
                        movedCard.priority || 1,
                        token
                    );
                } catch (error) {
                    console.error("Error moving card:", error);
                    const response = await getListsByBoardId(boardId!, token);
                    if (response.success && response.data) {
                        const listsWithCards = await Promise.all(
                            response.data.map(async (list) => {
                                const cardsRes = await getCardsByListId(list._id, token);
                                return {
                                    id: list._id,
                                    title: list.name,
                                    cards: cardsRes.success && cardsRes.data
                                        ? cardsRes.data.map(card => ({
                                            id: card._id,
                                            title: card.title,
                                            description: card.description,
                                            dueDate: card.dueDate,
                                            priority: card.priority,
                                            isCompleted: card.isCompleted,
                                        }))
                                        : [],
                                };
                            })
                        );
                        setLists(listsWithCards);
                    }
                }
                return;
            }

            if (overIdStr.startsWith("card-")) {
                const [overListId, overCardId] = overIdStr.replace("card-", "").split("_");

                if (activeListId === overListId) {
                    setLists((prev) =>
                        prev.map((l) => {
                            if (l.id === activeListId) {
                                const oldIndex = l.cards.findIndex((c : any) => c.id === activeCardId);
                                const newIndex = l.cards.findIndex((c : any) => c.id === overCardId);
                                if (oldIndex !== -1 && newIndex !== -1) {
                                    return { ...l, cards: arrayMove(l.cards, oldIndex, newIndex) };
                                }
                            }
                            return l;
                        })
                    );
                } else {
                    setLists((prev) => {
                        return prev.map((l) => {
                            if (l.id === activeListId) {
                                return { ...l, cards: l.cards.filter((c : any) => c.id !== activeCardId) };
                            }
                            if (l.id === overListId) {
                                const overIndex = l.cards.findIndex((c : any) => c.id === overCardId);
                                const newCards = [...l.cards];
                                newCards.splice(overIndex, 0, movedCard);
                                return { ...l, cards: newCards };
                            }
                            return l;
                        });
                    });

                    try {
                        await removeCard(activeCardId, token);
                        await createCard(
                            movedCard.title,
                            movedCard.description || "",
                            overListId,
                            movedCard.dueDate || "",
                            movedCard.priority || 1,
                            token
                        );
                    } catch (error) {
                        console.error("Error moving card:", error);
                        // Revert on error by refetching
                        const response = await getListsByBoardId(boardId!, token);
                        if (response.success && response.data) {
                            const listsWithCards = await Promise.all(
                                response.data.map(async (list) => {
                                    const cardsRes = await getCardsByListId(list._id, token);
                                    return {
                                        id: list._id,
                                        title: list.name,
                                        cards: cardsRes.success && cardsRes.data
                                            ? cardsRes.data.map(card => ({
                                                id: card._id,
                                                title: card.title,
                                                description: card.description,
                                                dueDate: card.dueDate,
                                                priority: card.priority,
                                                isCompleted: card.isCompleted,
                                            }))
                                            : [],
                                    };
                                })
                            );
                            setLists(listsWithCards);
                        }
                    }
                }
            }
        }
    };

    return (
        <div className="h-screen w-full bg-gray-50 pt-20">
            <div className="w-full h-full bg-gray-50 p-4 sm:p-8">
                {/* Filter Bar */}
                <div className="mb-4 flex gap-2 items-center">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FiFilter size={16} />
                        <span className="text-sm font-semibold">Filters</span>
                    </button>

                    {showFilters && (
                        <div className="flex gap-2 flex-wrap">
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Priorities</option>
                                <option value="1">Low</option>
                                <option value="2">Medium</option>
                                <option value="3">High</option>
                            </select>

                            <select
                                value={filters.dateSort}
                                onChange={(e) => setFilters({ ...filters, dateSort: e.target.value })}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="none">No Date Sort</option>
                                <option value="asc">Date: Earliest First</option>
                                <option value="desc">Date: Latest First</option>
                            </select>

                            <button
                                onClick={() => setFilters({ priority: 'all', dateSort: 'none' })}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    )}
                </div>

                <DndContext 
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                    sensors={sensors}
                >
                    <SortableContext items={filteredLists.map((l) => "list-" + l.id)} strategy={horizontalListSortingStrategy}>
                        <div className="flex items-start gap-4 overflow-x-auto overflow-y-auto pb-4 h-full">
                            {filteredLists.map((list) => (
                                <DragAndDrop key={list.id} id={"list-" + list.id}>
                                    <SortableContext
                                        items={list.cards.map((c: any) => "card-" + list.id + "_" + c.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <List
                                            list={list}
                                            onUpdateList={handleUpdateList}
                                            onDeleteList={handleDeleteList}
                                            onAddCard={handleAddCard}
                                            onUpdateCard={handleUpdateCard}
                                            onDeleteCard={handleDeleteCard}
                                        />
                                    </SortableContext>
                                </DragAndDrop>
                            ))}
                            {showNewListForm ? (
                                <div className="bg-white border-2 border-gray-300 rounded-xl p-4 w-64 flex-shrink-0">
                                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newListTitle}
                                        onChange={(e) => {
                                            setNewListTitle(e.target.value);
                                            if (newListError) setNewListError("");
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleAddList();
                                            } else if (e.key === "Escape") {
                                                setShowNewListForm(false);
                                                setNewListError("");
                                            }
                                        }}
                                        placeholder="List title..."
                                        className={`w-full px-3 py-2 border ${newListError ? 'border-red-500' : 'border-gray-300'} rounded-lg mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                        autoFocus
                                    />
                                    {newListError && <p className="text-xs text-red-500 mb-2">{newListError}</p>}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddList}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNewListForm(false);
                                                setNewListError("");
                                            }}
                                            className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewListForm(true)}
                                    className="w-64 h-40 bg-white border-2 border-gray-300 rounded-xl flex justify-center items-center hover:border-blue-400 hover:bg-blue-50 transition-all flex-shrink-0 group"
                                >
                                    <FiPlus size={40} className="text-blue-400 group-hover:text-blue-600 transition-colors" />
                                </button>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}

export default Boards;