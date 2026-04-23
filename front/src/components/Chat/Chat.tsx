import { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface Message {
    id: string;
    from: string;
    to: string;
    content: string;
    timestamp: string;
    read: boolean;
}

interface Conversation {
    username: string;
    lastMessage: Message;
    unreadCount: number;
}

interface ChatProps {
    currentUsername: string;
}

export const Chat = ({ currentUsername }: ChatProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipientUsername, setRecipientUsername] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const token = localStorage.getItem('token') || '';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!currentUsername || !isOpen || !token) return;

        const eventSource = new EventSource(`http://localhost:3000/api/chat/stream/${currentUsername}?token=${token}`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'message' || data.type === 'sent') {
                const message = data.data as Message;
                
                if (selectedUser && (message.from === selectedUser || message.to === selectedUser)) {
                    setMessages(prev => [...prev, message]);
                }
                
                loadConversations();
            }
        };

        eventSource.onerror = () => {
            console.error('SSE connection error');
        };

        return () => {
            eventSource.close();
        };
    }, [currentUsername, isOpen, selectedUser]);

    const loadConversations = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/chat/conversations/${currentUsername}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    useEffect(() => {
        if (isOpen && currentUsername) {
            loadConversations();
        }
    }, [isOpen, currentUsername]);

    const loadMessages = async (username: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/chat/history/${currentUsername}/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
                // Marquer comme lu
                await fetch(`http://localhost:3000/api/chat/read/${currentUsername}/${username}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                loadConversations();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const selectConversation = (username: string) => {
        setSelectedUser(username);
        setShowNewChat(false);
        loadMessages(username);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const recipient = selectedUser || recipientUsername;
        if (!newMessage.trim() || !recipient) return;

        try {
            const response = await fetch('http://localhost:3000/api/chat/send', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    from: currentUsername,
                    to: recipient,
                    content: newMessage.trim()
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewMessage('');
                if (!selectedUser) {
                    setSelectedUser(recipient);
                    setShowNewChat(false);
                    setRecipientUsername('');
                    loadMessages(recipient);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

    return (
        <>
            <button 
                className="chat-button"
                onClick={() => setIsOpen(!isOpen)}
                title="Chat"
            >
                💬
                {totalUnread > 0 && <span className="chat-badge">{totalUnread}</span>}
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>💬 Chat</h3>
                        <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
                    </div>

                    <div className="chat-content">
                        <div className="chat-sidebar">
                            <button 
                                className="new-chat-btn"
                                onClick={() => {
                                    setShowNewChat(true);
                                    setSelectedUser(null);
                                    setMessages([]);
                                }}
                            >
                                + Nouvelle conversation
                            </button>
                            
                            <div className="conversations-list">
                                {conversations.map(conv => (
                                    <div
                                        key={conv.username}
                                        className={`conversation-item ${selectedUser === conv.username ? 'active' : ''}`}
                                        onClick={() => selectConversation(conv.username)}
                                    >
                                        <div className="conversation-header">
                                            <strong>{conv.username}</strong>
                                            {conv.unreadCount > 0 && (
                                                <span className="unread-badge">{conv.unreadCount}</span>
                                            )}
                                        </div>
                                        <div className="conversation-preview">
                                            {conv.lastMessage.content.substring(0, 30)}
                                            {conv.lastMessage.content.length > 30 ? '...' : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="chat-main">
                            {showNewChat ? (
                                <div className="new-chat-form">
                                    <h4>Nouvelle conversation</h4>
                                    <input
                                        type="text"
                                        placeholder="Nom d'utilisateur..."
                                        value={recipientUsername}
                                        onChange={(e) => setRecipientUsername(e.target.value)}
                                        className="recipient-input"
                                    />
                                </div>
                            ) : selectedUser ? (
                                <div className="chat-header-user">
                                    <strong>{selectedUser}</strong>
                                </div>
                            ) : (
                                <div className="no-conversation">
                                    Sélectionnez une conversation ou créez-en une nouvelle
                                </div>
                            )}

                            {(selectedUser || showNewChat) && (
                                <>
                                    <div className="messages-container">
                                        {messages.map(msg => (
                                            <div
                                                key={msg.id}
                                                className={`message ${msg.from === currentUsername ? 'sent' : 'received'}`}
                                            >
                                                <div className="message-content">{msg.content}</div>
                                                <div className="message-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form onSubmit={sendMessage} className="message-form">
                                        <input
                                            type="text"
                                            placeholder="Écrivez un message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="message-input"
                                        />
                                        <button type="submit" className="send-btn">Envoyer</button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
