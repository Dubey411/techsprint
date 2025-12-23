import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ProfileModal from './ProfileModal';

const DashboardHeader = ({ title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center group">
                        <div className="bg-emerald-600 p-1.5 rounded-lg mr-2 group-hover:bg-emerald-700 transition">
                            <ChefHat className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
                            Food<span className="text-emerald-600">Connect</span>
                        </span>
                    </Link>
                    {title && (
                        <>
                            <span className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></span>
                            <h1 className="text-lg font-semibold text-slate-700">{title}</h1>
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <NotificationDropdown />

                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-full transition-colors focus:outline-none"
                        >
                            <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden md:block max-w-[100px] truncate">
                                {user?.name?.split(' ')[0]}
                            </span>
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMenuOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                                    <div className="px-4 py-2 border-b border-slate-50">
                                        <p className="text-xs text-slate-500">Signed in as</p>
                                        <p className="text-sm font-semibold truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsProfileOpen(true);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" /> Edit Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" /> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};

export default DashboardHeader;
