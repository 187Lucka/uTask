import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { verifyToken, clearAuthData } from './utils/auth';
import { setupFetchInterceptor } from './utils/fetchInterceptor';

// components
import Header from './components/Header/Header';
import { Chat } from './components/Chat/Chat';

// pages
import Auth from './pages/Auth/Auth';
import Board from './pages/Board/Board';
import Boards from './components/Boards/Boards';

interface User {
    id: string;
    username: string;
}

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setupFetchInterceptor();
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');

            if (token && storedUserId && storedUsername) {
                // Vérifier si le token est toujours valide
                const isValid = await verifyToken(token);
                
                if (isValid) {
                    setUser({
                        id: storedUserId,
                        username: storedUsername
                    });
                } else {
                    clearAuthData();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const handleUserLogin = (userData: User) => {
        setUser(userData);
        // Le token est déjà sauvegardé dans localStorage par Auth.tsx
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('username', userData.username);
    };

    const handleUserLogout = () => {
        setUser(null);
        clearAuthData();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="">
            {user && <Header user={user} onLogout={handleUserLogout} />}
            {user && <Chat currentUsername={user.username} />}
            <div className="">
                <Router>
                    <Routes>
                        <Route
                            path="/auth"
                            element={
                                user ? <Navigate to="/" replace /> : <Auth onUserLogin={handleUserLogin} />
                            }
                        />
                        <Route
                            path="/"
                            element={
                                user ? <Board /> : <Navigate to="/auth" replace />
                            }
                        />
                        <Route path="/boards/:id" element={user ? <Boards /> : <Navigate to="/auth" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </div>
        </div>
    )
}

export default App