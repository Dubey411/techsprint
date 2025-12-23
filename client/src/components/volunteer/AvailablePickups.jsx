import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    MapPin,
    Clock,
    Package,
    ArrowRight,
    Search,
    Filter,
    Info,
    AlertTriangle,
    Navigation,
    User,
    CheckCircle2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const PickupCard = ({ pickup, onAccept, onViewDetails }) => {
    const expiryTime = new Date(pickup.expiryDate);
    const now = new Date();
    const hoursLeft = (expiryTime - now) / (1000 * 60 * 60);

    const getUrgency = () => {
        if (hoursLeft < 2) return { label: 'High Urgency', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
        if (hoursLeft < 6) return { label: 'Medium', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
        return { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    };

    const urgency = getUrgency();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
            <div className={`h-1.5 w-full ${urgency.bg.replace('bg-', 'bg-')}`}>              <div className={`h-full ${urgency.color.replace('text-', 'bg-')} opacity-60`}></div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{pickup.title}</h3>
                            <p className="text-sm text-slate-500 font-medium">{pickup.donor?.name || 'Restaurant Partner'}</p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${urgency.bg} ${urgency.color} ${urgency.border}`}>
                        {urgency.label}
                    </span>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="truncate">{pickup.donor?.address || 'Address hidden'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                        <span>Pickup by {expiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">{pickup.quantity}</span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">{pickup.foodType}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewDetails(pickup)}
                        className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        View Details
                    </button>
                    <button
                        onClick={() => onAccept(pickup._id)}
                        className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                    >
                        <CheckCircle2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const AvailablePickups = () => {
    const [pickups, setPickups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        const fetchPickups = async () => {
            try {
                const { data } = await axios.get('/api/donations?status=available');
                setPickups(data);
            } catch (error) {
                console.error("Fetch pickups failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPickups();

        // Real-time integration
        const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');

        socket.on('new_donation', (newPickup) => {
            setPickups(prev => [newPickup, ...prev]);
        });

        socket.on('donation_updated', (updatedPickup) => {
            if (updatedPickup.status !== 'available') {
                setPickups(prev => prev.filter(p => p._id !== updatedPickup._id));
            } else {
                setPickups(prev => prev.map(p => p._id === updatedPickup._id ? updatedPickup : p));
            }
        });

        return () => socket.disconnect();
    }, []);

    const filteredPickups = useMemo(() => {
        return pickups.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.donor?.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filter === 'all' || p.foodType === filter;
            return matchesSearch && matchesFilter;
        });
    }, [pickups, searchQuery, filter]);

    const handleAccept = async (id) => {
        setIsAccepting(true);
        try {
            await axios.put(`/api/donations/${id}/claim`);
            // Socket will handle the removal from list
            // But we could also optimistically remove it
            setPickups(prev => prev.filter(p => p._id !== id));
            setSelectedPickup(null);
        } catch (error) {
            console.error("Accept failed", error);
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Available Pickups</h2>
                    <p className="text-slate-500 font-medium mt-1">Discover food rescue opportunities near you.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search pickups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none w-full md:w-64"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'bakery', 'meals', 'produce', 'dairy'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${filter === f
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-200'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredPickups.map(pickup => (
                            <PickupCard
                                key={pickup._id}
                                pickup={pickup}
                                onAccept={handleAccept}
                                onViewDetails={setSelectedPickup}
                            />
                        ))}
                    </AnimatePresence>

                    {filteredPickups.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-200"
                        >
                            <div className="p-4 bg-slate-50 rounded-full mb-4">
                                <Navigation className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No Pickups Nearby</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">We'll notify you as soon as new food becomes available for rescue.</p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Detailed View Modal */}
            <AnimatePresence>
                {selectedPickup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                        >
                            <button
                                onClick={() => setSelectedPickup(null)}
                                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-600" />
                            </button>

                            <div className="h-48 bg-emerald-600 relative flex items-center justify-center">
                                <div className="absolute inset-0 opacity-20 overflow-hidden">
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
                                    <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white rounded-full"></div>
                                </div>
                                <Package className="h-20 w-20 text-white relative z-10" />
                            </div>

                            <div className="p-10">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                            {selectedPickup.foodType}
                                        </span>
                                        <span className="text-xs text-slate-400 font-bold">• {selectedPickup.quantity} available</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900">{selectedPickup.title}</h3>
                                    <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                                        {selectedPickup.description || "Help rescue this surplus food and deliver it to our community partners."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <Navigation className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase">Location</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 truncate">{selectedPickup.donor?.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{selectedPickup.donor?.address}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase">Deadline</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {new Date(selectedPickup.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">Pick up ASAP</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSelectedPickup(null)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all uppercase tracking-wider text-xs"
                                    >
                                        Later
                                    </button>
                                    <button
                                        onClick={() => handleAccept(selectedPickup._id)}
                                        disabled={isAccepting}
                                        className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:bg-emerald-400"
                                    >
                                        {isAccepting ? 'Confirming...' : (
                                            <>
                                                Accept Rescue Task <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-8 flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                    <p className="text-[10px] text-blue-700 leading-tight font-medium">
                                        By accepting, you commit to picking up this food before the deadline. Please bring appropriate storage containers if possible.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AvailablePickups;
