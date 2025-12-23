import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'restaurant',
        address: '',
        location: { latitude: null, longitude: null }
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        location: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    });
                    alert('Location fetched!');
                },
                (error) => console.error(error)
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-10">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input
                            name="name"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Role</label>
                        <select
                            name="role"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleChange}
                            value={formData.role}
                        >
                            <option value="restaurant">Restaurant</option>
                            <option value="ngo">NGO</option>
                            <option value="volunteer">Volunteer</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Address</label>
                        <input
                            name="address"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={getLocation}
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition mb-2"
                        >
                            {formData.location.latitude ? 'Location Set' : 'Get Current Location'}
                        </button>
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                        >
                            Register
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-green-600">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
