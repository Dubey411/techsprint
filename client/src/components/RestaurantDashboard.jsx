import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from './common/DashboardHeader';

const RestaurantDashboard = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        foodType: 'veg',
        quantity: '',
        expiryDate: '',
    });
    const [msg, setMsg] = useState('');

    const fetchDonations = async () => {
        try {
            const { data } = await axios.get('/api/donations/my');
            setDonations(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/donations', formData);
            setMsg('Donation posted successfully!');
            setFormData({ title: '', description: '', foodType: 'veg', quantity: '', expiryDate: '' });
            fetchDonations();
        } catch (error) {
            setMsg('Error posting donation');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader title="Restaurant Dashboard" />
            <main className="p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-bold mb-4">Post New Donation</h3>
                        {msg && <p className="mb-2 text-green-600">{msg}</p>}
                        <form onSubmit={handleSubmit}>
                            <input className="w-full mb-3 p-2 border rounded" name="title" placeholder="Title (e.g., Leftover Rice)" value={formData.title} onChange={handleChange} required />
                            <textarea className="w-full mb-3 p-2 border rounded" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                            <select className="w-full mb-3 p-2 border rounded" name="foodType" value={formData.foodType} onChange={handleChange}>
                                <option value="veg">Veg</option>
                                <option value="non-veg">Non-Veg</option>
                            </select>
                            <input className="w-full mb-3 p-2 border rounded" name="quantity" placeholder="Quantity (e.g., 5kg)" value={formData.quantity} onChange={handleChange} required />
                            <input className="w-full mb-3 p-2 border rounded" type="datetime-local" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">Post Donation</button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-bold mb-4">My Donations</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {donations.map(d => (
                                <div key={d._id} className="border p-3 rounded hover:shadow-md transition">
                                    <h4 className="font-bold">{d.title}</h4>
                                    <p className="text-sm text-gray-600">Qty: {d.quantity} | Type: {d.foodType}</p>
                                    <p className="text-sm text-gray-600">Status: <span className={`font-semibold ${d.status === 'available' ? 'text-green-600' : 'text-blue-600'}`}>{d.status}</span></p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RestaurantDashboard;
