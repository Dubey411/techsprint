import { Link } from 'react-router-dom';
import { Home, PlusCircle, Clock, PieChart, Bell, Settings, LogOut, Utensils, Award } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${active
            ? 'bg-orange-50 text-orange-700 font-semibold shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon className={`h-5 w-5 ${active ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span>{label}</span>
    </button>
);

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RestaurantSidebar = ({ activeTab, setActiveTab }) => {
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
                    <div className="bg-orange-500 p-1.5 rounded-lg">
                        <Utensils className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">FoodConnect</span>
                </div>

                <nav className="space-y-1">
                    <SidebarItem
                        icon={Home}
                        label="Overview"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={PlusCircle}
                        label="Donate Food"
                        active={activeTab === 'donate'}
                        onClick={() => setActiveTab('donate')}
                    />
                    <SidebarItem
                        icon={Clock}
                        label="Scheduled / History"
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                    />
                    <SidebarItem
                        icon={PieChart}
                        label="Impact Insights"
                        active={activeTab === 'impact'}
                        onClick={() => setActiveTab('impact')}
                    />

                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100">
                <nav className="space-y-1">
                    <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
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

export default RestaurantSidebar;
