import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Clock, MapPin, User, CheckCircle, AlertTriangle, Phone, MoreVertical, Filter, RefreshCw } from 'lucide-react';

const socket = io('http://localhost:5000');

const PickupCard = ({ pickup, onAction }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'claimed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'picked_up': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const isUrgent = new Date(pickup.expiryDate) - new Date() < 3600000 * 2; // Less than 2 hours

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`bg-white rounded-xl border shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-all ${isUrgent ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}`}
        >
            {isUrgent && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-slate-500">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{pickup.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{pickup.donor?.name || 'Unknown Donor'}</p>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(pickup.status)} uppercase tracking-wide`}>
                    {pickup.status.replace('_', ' ')}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="space-y-1">
                    <p className="text-slate-400 text-xs uppercase font-medium tracking-wider">Details</p>
                    <p className="font-semibold text-slate-700">{pickup.quantity} • {pickup.foodType}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-slate-400 text-xs uppercase font-medium tracking-wider">Expires</p>
                    <p className={`font-semibold ${isUrgent ? 'text-red-600 flex items-center gap-1' : 'text-slate-700'}`}>
                        {isUrgent && <AlertTriangle className="h-3 w-3" />}
                        {new Date(pickup.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Volunteer</p>
                    {pickup.assignedVolunteer ? (
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Assigned</span>
                    ) : (
                        <span className="text-xs text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded">Pending</span>
                    )}
                </div>
                {pickup.assignedVolunteer ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                                {pickup.assignedVolunteer.name?.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700 text-sm">{pickup.assignedVolunteer.name}</span>
                        </div>
                        <button className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Phone className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-sm text-slate-400 italic">Waiting for pickup...</div>
                )}
            </div>

            <div className="flex gap-2 mt-auto">
                <button
                    onClick={() => onAction('track', pickup)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                >
                    <MapPin className="h-4 w-4" /> Track
                </button>
                <button
                    onClick={() => onAction('manage', pickup)}
                    className="w-10 flex items-center justify-center border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 hover:text-slate-600 transition-all"
                >
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

const ActivePickups = () => {
    const [pickups, setPickups] = useState([]);
    const [filter, setFilter] = useState('all'); // all, urgent, active, completed
    const [loading, setLoading] = useState(true);

    const fetchPickups = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/donations/claimed');
            setPickups(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickups();

        socket.on('donation_updated', (updatedDonation) => {
            setPickups(prev => {
                const exists = prev.find(p => p._id === updatedDonation._id);
                if (exists) {
                    return prev.map(p => p._id === updatedDonation._id ? updatedDonation : p);
                }
                // If not in list but claimed by us (this check might be complex without full user context, 
                // but usually the backend filter handles the initial fetch. 
                // Creating a new claimed item might need manual refresh or smarter socket payload)
                return prev;
            });
            // Optimization: Just refetch to be safe for now
            fetchPickups();
        });

        return () => {
            socket.off('donation_updated');
        };
    }, []);

    const filteredPickups = pickups.filter(p => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['claimed', 'picked_up'].includes(p.status);
        if (filter === 'completed') return ['delivered', 'completed'].includes(p.status);
        if (filter === 'urgent') return (new Date(p.expiryDate) - new Date() < 3600000 * 2) && p.status !== 'completed';
        return true;
    });

    const stats = {
        total: pickups.length,
        active: pickups.filter(p => ['claimed', 'picked_up'].includes(p.status)).length,
        urgent: pickups.filter(p => (new Date(p.expiryDate) - new Date() < 3600000 * 2) && p.status !== 'completed').length
    };

    const handleAction = (type, pickup) => {
        console.log("Action:", type, pickup._id);
        alert(`${type === 'track' ? 'Tracking' : 'Managing'} ${pickup.title}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Active Pickups</h2>
                    <p className="text-slate-500">Monitor and manage your ongoing food rescues.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'active' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Active <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs">{stats.active}</span>
                        </button>
                        <button
                            onClick={() => setFilter('urgent')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'urgent' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Urgent <span className="ml-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs">{stats.urgent}</span>
                        </button>
                    </div>
                    <button onClick={fetchPickups} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading && pickups.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-slate-400">Loading pickups...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredPickups.length > 0 ? (
                            filteredPickups.map(pickup => (
                                <PickupCard key={pickup._id} pickup={pickup} onAction={handleAction} />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
                            >
                                <p>No pickups found for this filter.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ActivePickups;
