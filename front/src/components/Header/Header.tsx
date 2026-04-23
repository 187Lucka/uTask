import { useState } from 'react';
import { CiUser } from "react-icons/ci";

interface User {
    id: string;
    username: string;
}

interface HeaderProps {
    user: User | null;
    onLogout?: () => void;
}

function Header({ user, onLogout }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        setIsMenuOpen(false);
    };
    

    return (
        <>
            <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-4/5 max-w-6xl bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-lg rounded-2xl">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
                            onClick={() => window.location.href = '/'}
                        >
                            Utasks
                        </h1>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm placeholder-gray-500"
                                placeholder="Search for tasks..."
                            />
                        </div>
                    </div>

                    {user && (
                        <div className="hidden md:flex items-center space-x-3">
                            <span className="text-gray-700 font-medium text-sm">
                                {user.username}
                            </span>
                            <div className="relative group">
                                <button className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    <CiUser className="h-6 w-6" />
                                </button>

                                {/* Menu déroulant desktop */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none z-60 relative"
                        >
                            {isMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    <div className="fixed inset-0 z-45 bg-white md:hidden flex flex-col">
                        <div className="h-20"></div>

                        <div className="flex-1 p-6 space-y-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm placeholder-gray-500"
                                    placeholder="Search for tasks..."
                                />
                            </div>

                            {user && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">{user.username}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default Header;