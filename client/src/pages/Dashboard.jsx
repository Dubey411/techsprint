import { useAuth } from '../context/AuthContext';
import RestaurantDashboard from '../components/restaurant/RestaurantDashboard';
import NGODashboard from '../components/ngo/NGODashboard';
import VolunteerDashboard from '../components/volunteer/VolunteerDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    switch (user.role) {
        case 'restaurant':
            return <RestaurantDashboard />;
        case 'ngo':
            return <NGODashboard />;
        case 'volunteer':
            return <VolunteerDashboard />;
        case 'admin':
            return (
                <div className="p-10">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="mt-4">Welcome Admin. Impact Analytics coming soon.</p>
                </div>
            );
        default:
            return <div className="p-10">Unknown role: {user.role}</div>;
    }
};

export default Dashboard;
