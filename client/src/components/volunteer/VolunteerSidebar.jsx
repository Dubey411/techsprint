import { Link, useLocation } from 'react-router-dom';
import { Home, List, Map, BarChart2, User, Bell, LogOut } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon className={`h-5 w-5 ${active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span>{label}</span>
    </Link>
);

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VolunteerSidebar = ({ activeTab, setActiveTab }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="w-64 bg-white h-screen border-r border-slate-100 flex flex-col fixed left-0 top-0 hidden md:flex z-40">
            <div className="p-6">
                <div className="flex items-center space-x-2 mb-8">
                    <div className="bg-emerald-500 p-1.5 rounded-lg">
                        <Home className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">TechSpark</span>
                </div>

                <nav className="space-y-1">
                    <SidebarItem
                        icon={Home}
                        label="Overview"
                        path="#"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={List}
                        label="Available Pickups"
                        path="#"
                        active={activeTab === 'available'}
                        onClick={() => setActiveTab('available')}
                    />
                    <SidebarItem
                        icon={Map}
                        label="Route Map"
                        path="#"
                        active={activeTab === 'map'}
                        onClick={() => setActiveTab('map')}
                    />
                    <SidebarItem
                        icon={BarChart2}
                        label="Impact"
                        path="#"
                        active={activeTab === 'impact'}
                        onClick={() => setActiveTab('impact')}
                    />
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100">
                <nav className="space-y-1">
                    <SidebarItem icon={User} label="Profile" path="#" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default VolunteerSidebar;
