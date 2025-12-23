import { Bell, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const NGOHeader = ({ user, stats }) => {
    const [status, setStatus] = useState('Open');

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-8 py-4 flex justify-between items-center">
            <div>
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-slate-900">{user?.name || 'Helping Hands NGO'}</h1>
                    {user?.verified && <CheckCircle className="h-5 w-5 text-blue-500" />}
                </div>
                <p className="text-slate-500 text-sm mt-0.5">Dashboard & Operations Control Center</p>
            </div>

            <div className="flex items-center space-x-6">

                {/* Operational Status Toggle */}
                <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1">
                    {['Open', 'Limited', 'Full'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${status === s
                                    ? s === 'Open' ? 'bg-emerald-500 text-white shadow-sm' : s === 'Limited' ? 'bg-amber-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                        {user?.name?.charAt(0) || 'N'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NGOHeader;
