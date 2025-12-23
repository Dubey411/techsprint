import { Bell, Search } from 'lucide-react';

const RestaurantHeader = ({ user, stats }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Kitchen Dashboard</h1>
                <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.name || 'Chef'}! Ready to reduce waste?</p>
            </div>

            <div className="flex items-center space-x-6">
                {/* Quick Stats */}
                <div className="hidden md:flex space-x-6 text-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Waste Saved</span>
                        <span className="font-bold text-slate-900">{stats?.wasteSaved || '0'} kg</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Impact Score</span>
                        <span className="font-bold text-emerald-600">{stats?.impactScore || '98'}%</span>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-slate-400 hover:text-orange-600 transition-colors rounded-full hover:bg-orange-50">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                        {user?.name?.charAt(0) || 'R'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default RestaurantHeader;
