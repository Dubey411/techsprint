import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Star, Award, Phone, MessageSquare, Filter, RefreshCw, Smartphone, X, Mail, Calendar, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VolunteerCard = ({ volunteer, onViewDetails }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
            onClick={() => onViewDetails(volunteer)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl border border-blue-100 shadow-inner">
                        {volunteer.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 leading-tight uppercase tracking-tight">{volunteer.name}</h3>
                        <p className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1 mt-1 font-mono">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" /> {volunteer.address || 'HQR VECTOR'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg uppercase tracking-widest border border-emerald-100">
                        Available
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">0.8 MILES</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Reliability</p>
                    <div className="flex items-center gap-1.5 text-slate-900 font-black">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        {volunteer.stats?.reliabilityScore || 98}%
                    </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Impact</p>
                    <div className="flex items-center gap-1.5 text-slate-900 font-black">
                        <Award className="h-3.5 w-3.5 text-purple-600" />
                        {volunteer.stats?.totalClaimed || 24}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    Assign Task
                </button>
                <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <MessageSquare className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

const VolunteerDetails = ({ volunteer, onClose }) => {
    if (!volunteer) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[100] border-l border-slate-100 flex flex-col"
        >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Volunteer Dossier</h2>
                <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all rotate-90 hover:rotate-0">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black mb-6 shadow-2xl shadow-blue-200 rotate-3">
                        {volunteer.name.charAt(0)}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">{volunteer.name}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verified Rescue Specialist
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <TrendingUp className="h-6 w-6 text-blue-600 mb-3" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Rescues</p>
                        <h4 className="text-2xl font-black text-slate-900">142</h4>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <Calendar className="h-6 w-6 text-purple-600 mb-3" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rank</p>
                        <h4 className="text-2xl font-black text-slate-900">Elite</h4>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="group">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 px-1">Contact Intelligence</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50/10 transition-all">
                                <Phone className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-bold text-slate-700 font-mono tracking-tight">{volunteer.phone || '+1 (555) 001-9234'}</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50/10 transition-all">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-bold text-slate-700 font-mono tracking-tight">{volunteer.email || 'rescue@node.js'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 px-1">Geospatial Data</p>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-50/10 transition-all">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-bold text-slate-700 leading-tight">{volunteer.address || 'Sector 7G, Quantum Heights, DL'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300">
                    Initiate Contact
                </button>
            </div>
        </motion.div>
    );
};

const VolunteerManager = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/users/volunteers?sortBy=reliability');
            setVolunteers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
    }, []);

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Specialists</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Personnel Oversight & Logistics</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white rounded-2xl border border-slate-100 p-1.5 shadow-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('available')}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === 'available' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Active
                        </button>
                    </div>
                    <button onClick={fetchVolunteers} className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 shadow-xl transition-all">
                        <RefreshCw className={`h-5 w-5 text-slate-400 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-96 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying network...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {volunteers.map(volunteer => (
                            <VolunteerCard
                                key={volunteer._id}
                                volunteer={volunteer}
                                onViewDetails={(v) => setSelectedVolunteer(v)}
                            />
                        ))}
                    </AnimatePresence>
                    {volunteers.length === 0 && (
                        <div className="col-span-full py-24 text-center text-slate-400 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-10" />
                            <p className="text-xs font-black uppercase tracking-widest">No personnel found in current grid.</p>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {selectedVolunteer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVolunteer(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90]"
                        />
                        <VolunteerDetails
                            volunteer={selectedVolunteer}
                            onClose={() => setSelectedVolunteer(null)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VolunteerManager;
