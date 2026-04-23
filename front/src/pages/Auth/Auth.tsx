import { useState } from "react";
import { register, login } from "../../api/Register";
import { useNavigate } from "react-router-dom";

interface User {
    id: string;
    username: string;
}

interface AuthProps {
    onUserLogin: (user: User) => void;
}

function Auth({ onUserLogin }: AuthProps) {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            if (isLogin) {
                console.log("Connexion avec:", formData.username);
                const result = await login(formData.username, formData.password);

                if (result.success && result.data) {
                    localStorage.setItem("token", result.data.token);

                    onUserLogin({
                        id: result.data._id,
                        username: result.data.username,
                    });
                    navigate("/");
                } else {
                    handleApiErrors(result);
                }
            } else {
                console.log("Inscription avec:", formData.username);
                const result = await register(formData.username, formData.password);

                if (result.success && result.data) {
                    localStorage.setItem("token", result.data.token);

                    onUserLogin({
                        id: result.data._id,
                        username: result.data.username,
                    });
                    navigate("/");
                } else {
                    handleApiErrors(result);
                }
            }
        } catch (error) {
            setErrorMsg("Erreur réseau ou serveur.");
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApiErrors = (result: any) => {
        if (result.errors && result.errors.length > 0) {
            setErrorMsg(result.errors[0].message);
        } else if (result.message) {
            setErrorMsg(result.message);
        } else {
            setErrorMsg("Erreur inconnue.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {isLogin ? "Connexion" : "Inscription"}
                        </h2>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 text-red-600 text-center font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Nom d'utilisateur
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-lg"
                                placeholder="Entrez votre nom d'utilisateur"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-lg"
                                placeholder="Entrez votre mot de passe"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.username.trim() || !formData.password.trim()}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-200 ${loading || !formData.username.trim() || !formData.password.trim()
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Chargement...
                                </div>
                            ) : isLogin ? (
                                "Se connecter"
                            ) : (
                                "S'inscrire"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrorMsg(null);
                            }}
                            className="mt-2 text-blue-600 hover:text-blue-800 font-medium transition duration-200 hover:underline"
                        >
                            {isLogin ? "Créer un compte" : "Se connecter"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Auth;