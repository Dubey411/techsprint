import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapPin, Clock, Weight, ChevronRight, Check, X, Phone, MessageSquare, Info, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import LocationPickerMap from '../common/LocationPickerMap';

const DonationCard = ({ donation, onAccept, onDecline }) => {
    const [showContact, setShowContact] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4 hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative"
        >
            {donation.status === 'urgent' && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-widest">
                    Urgent Rescue
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${donation.foodType === 'veg' ? 'bg-emerald-50 text-emerald-600' :
                                donation.foodType === 'non-veg' ? 'bg-red-50 text-red-600' :
                                    'bg-blue-50 text-blue-600'
                            }`}>
                            {donation.foodType}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase">• Posted recently</span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{donation.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed">{donation.description || 'No additional description provided.'}</p>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                        <div className="flex items-center text-slate-600 font-bold">
                            <div className="p-2 bg-slate-50 rounded-lg mr-3 text-slate-400">
                                <Weight className="h-4 w-4" />
                            </div>
                            {donation.quantity}
                        </div>
                        <div className="flex items-center text-slate-600 font-bold">
                            <div className="p-2 bg-slate-50 rounded-lg mr-3 text-slate-400">
                                <Clock className="h-4 w-4" />
                            </div>
                            {new Date(donation.expiryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center text-slate-600 font-bold col-span-2 lg:col-span-1">
                            <div className="p-2 bg-slate-50 rounded-lg mr-3 text-slate-400">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <span className="truncate">{donation.donor?.name || 'Restaurant Partner'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 justify-center min-w-[180px]">
                    <button
                        onClick={() => onAccept(donation.id)}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="h-4 w-4" /> Claim Donation
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowContact(!showContact)}
                            className={`flex-1 flex items-center justify-center p-3 rounded-2xl font-bold text-xs transition-all border ${showContact ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Phone className="h-4 w-4 mr-2" /> {showContact ? 'Close' : 'Contact'}
                        </button>
                        <button
                            onClick={() => onDecline(donation.id)}
                            className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showContact && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-50 p-4 rounded-2xl border border-slate-100"
                            >
                                <div className="space-y-3">
                                    <a
                                        href={`tel:${donation.donor?.phone || ''}`}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600"
                                    >
                                        <Phone className="h-3 w-3" /> {donation.donor?.phone || 'Add phone in profile'}
                                    </a>
                                    <button className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600">
                                        <MessageSquare className="h-3 w-3" /> Send Quick Message
                                    </button>
                                    <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-medium">
                                        Location: {donation.donor?.address}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

const DonationFeed = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Drop Location State
    const [showMapModal, setShowMapModal] = useState(false);
    const [claimingDonation, setClaimingDonation] = useState(null);
    const [dropLocation, setDropLocation] = useState(null);

    const fetchDonations = useCallback(async () => {
        try {
            // Fetch ALL available donations for now to ensure we see them
            // In prod, would use geo-query: /api/donations?radius=50&lat=...
            const url = '/api/donations?status=available';
            
            const { data } = await axios.get(url);
            setDonations(data);
        } catch (error) {
            console.error("Failed to fetch donations", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations]);

    const handleInitiateClaim = (donation) => {
        setClaimingDonation(donation);
        // Default to user's location if available, else null
        if (user?.location?.coordinates) {
             setDropLocation({
                 lat: user.location.coordinates[1],
                 lng: user.location.coordinates[0]
             });
        }
        setShowMapModal(true);
    };

    const handleConfirmClaim = async () => {
        if (!claimingDonation || !dropLocation) return;

        try {
            await axios.put(`/api/donations/${claimingDonation.id}/claim`, {
                dropLocation: {
                    type: 'Point',
                    coordinates: [dropLocation.lng, dropLocation.lat],
                    address: "NGO Location" // Could reverse geocode if needed
                }
            });
            
            // Remove from list
            setDonations(prev => prev.filter(d => d.id !== claimingDonation.id));
            alert("Donation Claimed! Volunteers can now see the drop location.");
            setShowMapModal(false);
            setClaimingDonation(null);
        } catch (error) {
            console.error("Failed to claim", error);
            alert("Failed to claim donation");
        }
    };

    const handleDecline = (id) => {
        setDonations(prev => prev.filter(d => d.id !== id));
    };

    if (loading) return (
        <div className="p-20 text-center">
            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Scanning neighborhood...</p>
        </div>
    );

    return (
        <div className="max-w-4xl pb-10">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Rescue Feed</h2>
                    <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-widest">Available donations from restaurants.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchDonations} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider">
                        Refresh
                    </button>
                </div>
            </div>

            <AnimatePresence mode='popLayout'>
                {donations.length > 0 ? (
                    donations.map(donation => (
                        <DonationCard
                            key={donation.id}
                            donation={donation}
                            onAccept={() => handleInitiateClaim(donation)}
                            onDecline={handleDecline}
                        />
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm"
                    >
                        <div className="h-24 w-24 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-8">
                            <Check className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="font-black text-slate-900 text-3xl mb-2 tracking-tight uppercase">No New Donations</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">There are no available donations to claim right now.</p>
                        <button
                            onClick={fetchDonations}
                            className="mt-10 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                            Refresh Radar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Location Verification Modal */}
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
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Confirm Drop Location</h3>
                                    <p className="text-xs text-slate-500">Where should the volunteer deliver this?</p>
                                </div>
                                <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>
                            
                            <div className="h-80 w-full relative">
                                <LocationPickerMap
                                    onLocationSelect={setDropLocation}
                                    initialPosition={dropLocation}
                                />
                                <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-sm">
                                    <MapPin className="h-4 w-4 inline-block mr-1 text-red-500" />
                                    Drag the marker to the exact drop-off point for your NGO.
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
                                <button 
                                    onClick={() => setShowMapModal(false)} 
                                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmClaim}
                                    disabled={!dropLocation}
                                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Confirm & Claim
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DonationFeed;
