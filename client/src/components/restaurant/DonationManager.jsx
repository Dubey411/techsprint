import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const DonationManager = () => {
    const [formData, setFormData] = useState({
        title: '',
        foodType: 'veg',
        quantity: '',
        expiryDate: '',
        description: '',
    });
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Simulated AI Logic
    const handleSmartInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Simple heuristic: If food type changes, suggest expiry
        if (name === 'foodType') {
            const hours = value === 'cooked' ? 4 : value === 'non-veg' ? 24 : 48;
            const suggestion = new Date(new Date().getTime() + hours * 60 * 60 * 1000);
            setSuggestions({
                timeWindow: `${hours} hours`,
                urgency: hours < 6 ? 'High' : 'Medium',
                expiry: suggestion.toISOString().substring(0, 16) // format for datetime-local
            });
        }
    };

    const applySuggestion = () => {
        if (suggestions) {
            setFormData(prev => ({ ...prev, expiryDate: suggestions.expiry }));
            setSuggestions(null); // Clear after applying
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/donations', formData, {
                withCredentials: true
            });
            setSuccess(true);
            setFormData({ title: '', foodType: 'veg', quantity: '', expiryDate: '', description: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to post donation", error);
            alert("Error posting donation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Add New Donation</h2>
                <p className="text-slate-500">List surplus food for pickup. Our engine will match you with the nearest NGO.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Food Basics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleSmartInput}
                                    placeholder="e.g. Grilled Chicken Leftover"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                <input
                                    type="text"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleSmartInput}
                                    placeholder="e.g. 5kg or 20 boxes"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Smart Section */}
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" /> AI Assistant
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-orange-900 mb-1">Food Category</label>
                                    <select
                                        name="foodType"
                                        value={formData.foodType}
                                        onChange={handleSmartInput}
                                        className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="veg">Vegetarian</option>
                                        <option value="non-veg">Non-Vegetarian</option>
                                        <option value="cooked">Cooked Meals (Hot)</option>
                                        <option value="bakery">Bakery / Dry</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-orange-900 mb-1">Expiry Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleSmartInput}
                                        className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* AI Suggestions Popover */}
                            <AnimatePresence>
                                {suggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 pt-4 border-t border-orange-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm text-orange-800">
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                <span>Suggested expiry: <strong>{suggestions.timeWindow}</strong> based on category.</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={applySuggestion}
                                                className="text-xs bg-white border border-orange-300 text-orange-700 px-3 py-1.5 rounded-full hover:bg-orange-100 font-semibold"
                                            >
                                                Apply Suggestion
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleSmartInput}
                                rows="3"
                                placeholder="Contains nuts, gluten free, etc."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex items-center justify-end space-x-4">
                            {success && (
                                <span className="text-emerald-600 font-medium flex items-center animate-in fade-in slide-in-from-right-5">
                                    <CheckCircle className="h-5 w-5 mr-2" /> Donation Listed!
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all transform hover:scale-105 shadow-lg shadow-slate-200 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : <><Plus className="h-5 w-5 mr-2" /> List Donation</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default DonationManager;
