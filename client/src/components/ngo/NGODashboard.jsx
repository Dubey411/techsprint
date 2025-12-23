import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NGOSidebar from './NGOSidebar';
import NGOHeader from './NGOHeader';
import NGOOverview from './NGOOverview';
import DonationFeed from './DonationFeed';
import ActivePickups from './ActivePickups';
import CapacityManager from './CapacityManager';
import VolunteerManager from './VolunteerManager';
import ImpactAnalytics from './ImpactAnalytics';
import { motion, AnimatePresence } from 'framer-motion';

const NGODashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Mock stats
    const stats = { incoming: 450, volunteers: 12 };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <NGOOverview />;
            case 'donations':
                return <DonationFeed />;
            case 'pickups':
                return <ActivePickups />;
            case 'capacity':
                return <CapacityManager />;
            case 'volunteers':
                return <VolunteerManager />;
            case 'analytics':
                return <ImpactAnalytics />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <NGOSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 md:ml-64 relative overflow-y-auto">
                <NGOHeader user={user} stats={stats} />

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

export default NGODashboard;
