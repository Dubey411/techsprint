import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RestaurantSidebar from './RestaurantSidebar';
import RestaurantHeader from './RestaurantHeader';
import Overview from './Overview';
import DonationManager from './DonationManager';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Mock stats for header
    const stats = { wasteSaved: 124, impactScore: 92 };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview />;
            case 'donate':
                return <DonationManager />;
            case 'history':
                return <div className="text-center py-20 text-slate-500">History Module Coming Soon</div>; // Placeholder
            case 'impact':
                return <div className="text-center py-20 text-slate-500">Impact Analytics Coming Soon</div>; // Placeholder
            default:
                return <Overview />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <RestaurantSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 md:ml-64 relative overflow-y-auto">
                <RestaurantHeader user={user} stats={stats} />

                <main className="p-8 max-w-7xl mx-auto">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
