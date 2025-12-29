import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import VolunteerSidebar from './VolunteerSidebar';
import VolunteerHeader from './VolunteerHeader';
import TaskCard from './TaskCard';
import AvailablePickups from './AvailablePickups';
import RouteMap from './RouteMap';
import { motion, AnimatePresence } from 'framer-motion';

const VolunteerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [availableTasks, setAvailableTasks] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [loading, setLoading] = useState(true);

    const stats = { meals: 120, hours: 45 }; // Mock stats for now

    const fetchData = async () => {
        try {
            const [availableRes, myTasksRes] = await Promise.all([
                axios.get('/api/donations?status=claimed'),
                axios.get('/api/donations/tasks')
            ]);
            setAvailableTasks(availableRes.data.filter(d => !d.assignedVolunteer));
            setMyTasks(myTasksRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleAcceptTask = async (id) => {
        try {
            await axios.put(`/api/donations/${id}/claim`); // Using claim endpoint which assigns to volunteer
            // Optimistic update
            const task = availableTasks.find(t => t._id === id);
            setAvailableTasks(prev => prev.filter(t => t._id !== id));
            setMyTasks(prev => [task, ...prev]);
            alert("Task Accepted!");
            fetchData(); // Refresh to ensure sync
        } catch (error) {
            console.error(error);
            alert("Failed to accept task");
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await axios.put(`/api/donations/${id}/status`, { status: newStatus });
            fetchData();
        } catch (error) {
            console.error("Update failed", error);
        }
    }

    const handleViewMap = (task) => {
        setActiveTask(task);
        setActiveTab('map');
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            <VolunteerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 md:ml-64 relative overflow-y-auto">
                <VolunteerHeader user={user} stats={stats} />

                <main className="p-8 max-w-7xl mx-auto">
                    {loading ? <p>Loading...</p> : (
                        <AnimatePresence mode='wait'>
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-10"
                                >
                                    {/* Section: My Active Tasks */}
                                    <section>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-slate-900">My Active Tasks</h2>
                                            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All</button>
                                        </div>
                                        {myTasks.length === 0 ? (
                                            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
                                                No active tasks. Check available pickups!
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {myTasks.map(task => (
                                                    <TaskCard
                                                        key={task._id}
                                                        task={task}
                                                        variant="active"
                                                        actionLabel={task.status === 'claimed' ? 'Mark Picked Up' : 'Mark Delivered'}
                                                        onAccept={(id) => handleUpdateStatus(id, task.status === 'claimed' ? 'picked_up' : 'completed')}
                                                        onViewMap={() => handleViewMap(task)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Section: Available Pickups */}
                                    <section>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-slate-900">Available Pickups Nearby</h2>
                                            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View Map</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {availableTasks.map(task => (
                                                <TaskCard key={task._id} task={task} onAccept={handleAcceptTask} />
                                            ))}
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {activeTab === 'map' && (
                                <RouteMap donation={activeTask} />
                            )}

                            {activeTab === 'available' && (
                                <AvailablePickups />
                            )}

                            {/* Placeholder for other tabs */}
                            {activeTab !== 'overview' && activeTab !== 'available' && activeTab !== 'map' && (
                                <div className="flex items-center justify-center h-64 text-slate-500">
                                    Feature under construction
                                </div>
                            )}
                        </AnimatePresence>
                    )}
                </main>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
