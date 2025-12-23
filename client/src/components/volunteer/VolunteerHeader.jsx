import { useState } from 'react';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';
import ProfileModal from '../common/ProfileModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VolunteerHeader = ({ user, stats }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Good evening, {user?.name.split(' ')[0]} 👋</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Ready to make a difference today?</p>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Quick Stats */}
                    <div className="hidden md:flex space-x-6 text-sm">
                        <div className="flex flex-col items-end">
                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Meals Saved</span>
                            <span className="font-bold text-slate-900">{stats.meals}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Hours</span>
                            <span className="font-bold text-slate-900">{stats.hours}h</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                    <div className="flex items-center space-x-4">
                        <NotificationDropdown />

                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition-colors focus:outline-none"
                            >
                                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
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
                                            <UserIcon className="h-4 w-4" /> Edit Profile
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
                </div>
            </header>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
};

export default VolunteerHeader;
