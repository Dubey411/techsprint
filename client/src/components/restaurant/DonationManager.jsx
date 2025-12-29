import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Sparkles, AlertCircle, CheckCircle, MapPin, X, Globe } from 'lucide-react';
import axios from 'axios';
import LocationPickerMap from '../common/LocationPickerMap';

const DonationManager = () => {
    const [formData, setFormData] = useState({
        title: '',
        foodType: 'veg',
        quantity: '',
        expiryDate: '',
        description: '',
        location: null,
    });
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
    const [showMapModal, setShowMapModal] = useState(false);
    const [tempMapLocation, setTempMapLocation] = useState(null);
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

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    location: {
                        type: 'Point',
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    }
                }));
                setLocationStatus('success');
            },
            (error) => {
                console.error("Error getting location", error);
                setLocationStatus('error');
            }
        );
    };

    const applySuggestion = () => {
        if (suggestions) {
            setFormData(prev => ({ ...prev, expiryDate: suggestions.expiry }));
            setSuggestions(null); // Clear after applying
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.location) {
            alert("Please select a pickup location (GPS or Map) before submitting.");
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/donations', formData, {
                withCredentials: true
            });
            setSuccess(true);
            setFormData({ title: '', foodType: 'veg', quantity: '', expiryDate: '', description: '', location: null });
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to post donation", error);
            if (error.response && error.response.status === 403) {
                alert("Permission Denied: You must be logged in as a RESTAURANT to post donations.");
            } else {
                const sdkMsg = error.response?.data?.message || "Error posting donation. Please try again.";
                alert(`Failed: ${sdkMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmMapLocation = () => {
        if (tempMapLocation) {
            setFormData(prev => ({
                ...prev,
                location: {
                    type: 'Point',
                    coordinates: [tempMapLocation.lng, tempMapLocation.lat]
                }
            }));
            setLocationStatus('success');
            setShowMapModal(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto relative">
             {/* Map Modal */}
             <AnimatePresence>
                {showMapModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg">Select Pickup Location</h3>
                                <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            <div className="h-96 w-full relative">
                                <LocationPickerMap 
                                    onLocationSelect={setTempMapLocation} 
                                    initialPosition={formData.location ? { lat: formData.location.coordinates[1], lng: formData.location.coordinates[0] } : null}
                                />
                            </div>
                            <div className="p-4 border-t border-slate-100 flex justify-end space-x-3">
                                <button onClick={() => setShowMapModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button 
                                    onClick={handleConfirmMapLocation}
                                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Add New Donation</h2>
                <p className="text-slate-500">List surplus food for pickup. Our engine will match you with the nearest NGO.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Location Prompt */}
                        <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <div className="flex items-center space-x-3">
                                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">Set Pickup Location</p>
                                    <p className="text-xs text-emerald-700">
                                        {locationStatus === 'success' 
                                            ? 'Location captured successfully!' 
                                            : 'Share exact GPS coordinates for better pickup.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={locationStatus === 'loading'}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center ${
                                        locationStatus === 'success'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    }`}
                                >
                                     {locationStatus === 'loading' ? '...' : <MapPin className="h-4 w-4 mr-1" />}
                                     {locationStatus === 'success' ? 'Located' : 'GPS'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowMapModal(true)}
                                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex items-center"
                                >
                                    <Globe className="h-4 w-4 mr-1" />
                                    Map
                                </button>
                            </div>
                        </div>

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
