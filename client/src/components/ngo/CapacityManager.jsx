import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Save, AlertTriangle, Thermometer, Box, Users, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const CapacityManager = () => {
    const { user, updateUser } = useAuth();
    const [capacity, setCapacity] = useState({
        refrigerationMax: 100,
        refrigerationUsed: 0,
        storageMax: 500,
        storageUsed: 0,
        volunteerLimit: 10
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user && user.capacity) {
            setCapacity({
                refrigerationMax: user.capacity.refrigerationMax || 100,
                refrigerationUsed: user.capacity.refrigerationUsed || 0,
                storageMax: user.capacity.storageMax || 500,
                storageUsed: user.capacity.storageUsed || 0,
                volunteerLimit: user.capacity.volunteerLimit || 10
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setCapacity({ ...capacity, [e.target.name]: parseInt(e.target.value) || 0 });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data } = await axios.put('/api/auth/profile', { capacity });
            updateUser(data);
            setMsg('Capacity settings updated!');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Failed to update capacity.');
        } finally {
            setLoading(false);
        }
    };

    const getUsageColor = (used, max) => {
        const percentage = (used / max) * 100;
        if (percentage > 90) return 'bg-red-500';
        if (percentage > 70) return 'bg-orange-500';
        return 'bg-emerald-500';
    };

    const getRiskLevel = (used, max) => {
        const percentage = (used / max) * 100;
        if (percentage > 90) return { label: 'CRITICAL', color: 'text-red-600' };
        if (percentage > 75) return { label: 'HIGH', color: 'text-orange-600' };
        return { label: 'NORMAL', color: 'text-emerald-600' };
    };

    // Forecasting Logic (Mock)
    const forecast = {
        refrigeration: capacity.refrigerationUsed + 20, // Example upcoming
        storage: capacity.storageUsed + 50
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Capacity Manager</h2>
                <p className="text-slate-500">Manage storage limits, volunteer availability, and distribution readiness.</p>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Refrigeration Status */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Refrigeration</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{capacity.refrigerationUsed} / {capacity.refrigerationMax} kg</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Thermometer className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((capacity.refrigerationUsed / capacity.refrigerationMax) * 100, 100)}%` }}
                            className={`h-2 rounded-full ${getUsageColor(capacity.refrigerationUsed, capacity.refrigerationMax)}`}
                        ></motion.div>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                        <span className={getRiskLevel(capacity.refrigerationUsed, capacity.refrigerationMax).color}>
                            Risk: {getRiskLevel(capacity.refrigerationUsed, capacity.refrigerationMax).label}
                        </span>
                        <span className="text-slate-400">{(capacity.refrigerationMax - capacity.refrigerationUsed)} kg available</span>
                    </div>
                </div>

                {/* Dry Storage Status */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Dry Storage</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{capacity.storageUsed} / {capacity.storageMax} kg</h3>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                            <Box className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((capacity.storageUsed / capacity.storageMax) * 100, 100)}%` }}
                            className={`h-2 rounded-full ${getUsageColor(capacity.storageUsed, capacity.storageMax)}`}
                        ></motion.div>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                        <span className={getRiskLevel(capacity.storageUsed, capacity.storageMax).color}>
                            Risk: {getRiskLevel(capacity.storageUsed, capacity.storageMax).label}
                        </span>
                        <span className="text-slate-400">{(capacity.storageMax - capacity.storageUsed)} kg available</span>
                    </div>
                </div>

                {/* Volunteer Bandwidth */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Volunteer Limit</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{capacity.volunteerLimit} <span className="text-sm font-normal text-slate-400">concurrent</span></h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                        Adjust this limit based on your team's current availability to handle incoming pickups.
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900">Capacity Controls</h3>
                        {msg && <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">{msg}</span>}
                    </div>

                    <div className="space-y-8">
                        {/* Refrigeration Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-medium text-slate-700">Refrigeration Capacity (kg)</label>
                                <span className="font-bold text-slate-900">{capacity.refrigerationMax} kg</span>
                            </div>
                            <input
                                type="range"
                                name="refrigerationMax"
                                min="0"
                                max="1000"
                                step="10"
                                value={capacity.refrigerationMax}
                                onChange={handleChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>0 kg</span>
                                <span>1000 kg</span>
                            </div>
                        </div>

                        {/* Used Refrigeration Input (Mock Manual Update) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Refrigerated Stock (Manual Override)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    name="refrigerationUsed"
                                    value={capacity.refrigerationUsed}
                                    onChange={handleChange}
                                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                                <span className="text-sm text-slate-500">kg currently in fridge</span>
                            </div>
                        </div>


                        {/* Storage Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-medium text-slate-700">Dry Storage Capacity (kg)</label>
                                <span className="font-bold text-slate-900">{capacity.storageMax} kg</span>
                            </div>
                            <input
                                type="range"
                                name="storageMax"
                                min="0"
                                max="2000"
                                step="50"
                                value={capacity.storageMax}
                                onChange={handleChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>0 kg</span>
                                <span>2000 kg</span>
                            </div>
                        </div>

                        {/* Used Storage Input (Mock Manual Update) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Dry Stock (Manual Override)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    name="storageUsed"
                                    value={capacity.storageUsed}
                                    onChange={handleChange}
                                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
                                />
                                <span className="text-sm text-slate-500">kg currently in shelf</span>
                            </div>
                        </div>

                        {/* Volunteer Limit */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="font-medium text-slate-700">Max Concurrent Pickups (Volunteer Limit)</label>
                                <span className="font-bold text-slate-900">{capacity.volunteerLimit} active</span>
                            </div>
                            <input
                                type="range"
                                name="volunteerLimit"
                                min="1"
                                max="50"
                                value={capacity.volunteerLimit}
                                onChange={handleChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
                            >
                                <Save className="h-5 w-5" />
                                {loading ? 'Saving...' : 'Update Capacity Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forecast & Insight */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-lg">Capacity Forecast (6h)</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1 text-slate-300">
                                    <span>Incoming Refrigeration</span>
                                    <span>+20 kg exp.</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${forecast.refrigeration > capacity.refrigerationMax ? 'bg-red-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min((forecast.refrigeration / capacity.refrigerationMax) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                {forecast.refrigeration > capacity.refrigerationMax && (
                                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Potential Overflow Warning
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1 text-slate-300">
                                    <span>Incoming Storage</span>
                                    <span>+50 kg exp.</span>
                                </div>
                                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${forecast.storage > capacity.storageMax ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min((forecast.storage / capacity.storageMax) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <h4 className="font-bold mb-2 text-emerald-400">Recommendation</h4>
                            {forecast.refrigeration > capacity.refrigerationMax ? (
                                <p className="text-sm text-slate-200">
                                    <span className="font-bold text-red-400">Pause Perishable Intake.</span> Your cold storage is projected to hit capacity. Prioritize distribution immediately.
                                </p>
                            ) : (
                                <p className="text-sm text-slate-200">
                                    <span className="font-bold text-emerald-400">Safe to Accept.</span> You have sufficient headroom for incoming donations.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-orange-900 text-sm">AI Optimization Tip</h4>
                                <p className="text-sm text-orange-800 mt-1">
                                    Based on your current distribution rate, we recommend increasing your volunteer limit to <strong>15</strong> for the weekend to handle the expected surge.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CapacityManager;
