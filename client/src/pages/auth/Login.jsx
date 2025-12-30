import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ChefHat } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('restaurant'); // Default active tab
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userData = await login(email, password);

            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if account role matches selected tab
            if (userData.role !== selectedRole) {
                await logout(); // Clear the invalid session
                setError(`This account is registered as a ${userData.role.toUpperCase()}. Please switch to the ${userData.role} tab.`);
                setLoading(false);
                return;
            }

            navigate('/dashboard');
        } catch (err) {
            console.error("Login Error:", err);
            
            let displayError = 'Invalid credentials';
            
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                displayError = 'Incorrect email or password. Please try again.';
            } else if (err.code === 'auth/too-many-requests') {
                displayError = 'Too many failed attempts. Please try again later.';
            } else if (err.response?.data?.message) {
                displayError = err.response.data.message;
            } else if (err.message) {
                displayError = err.message;
            }

            setError(displayError);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Link to="/" className="inline-flex items-center space-x-2 group mb-6">
                    <div className="bg-emerald-600 p-2 rounded-lg">
                        <ChefHat className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                        Food<span className="text-emerald-600">Connect</span>
                    </span>
                </Link>
                <h2 className="text-3xl font-extrabold text-slate-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Sign in to your {selectedRole} account
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">

                    {/* Role Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                        {['restaurant', 'ngo', 'volunteer'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => { setError(''); setSelectedRole(role); }}
                                className={`flex-1 capitalize text-sm font-medium py-2 rounded-lg transition-all ${selectedRole === role
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-shadow"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                                    Forgot your password
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Don't have an account?</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Link
                                to="/register"
                                className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-emerald-600 hover:bg-slate-50 transition-colors"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
