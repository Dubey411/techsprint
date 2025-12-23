import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from './common/DashboardHeader';

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const NGODashboard = () => {
    const [donations, setDonations] = useState([]);
    const [position, setPosition] = useState([28.6139, 77.2090]); // Default New Delhi

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                fetchNearbyDonations(pos.coords.latitude, pos.coords.longitude);
            });
        } else {
            fetchNearbyDonations(position[0], position[1]);
        }
    }, []);

    const fetchNearbyDonations = async (lat, lng) => {
        try {
            const { data } = await axios.get(`/api/donations?lat=${lat}&lng=${lng}&radius=10`);
            setDonations(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleClaim = async (id) => {
        try {
            await axios.put(`/api/donations/${id}/claim`);
            alert('Donation claimed successfully!');
            fetchNearbyDonations(position[0], position[1]); // Refresh
        } catch (error) {
            alert('Failed to claim donation');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            <DashboardHeader title="Find Donations" />
            <main className="flex-1 p-6 flex flex-col overflow-hidden">
                <div className="flex-1 flex gap-4 min-h-0">
                    <div className="w-2/3 h-full rounded-xl overflow-hidden border shadow-sm">
                        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {donations.map(d => (
                                d.location && d.location.coordinates && (
                                    <Marker key={d._id} position={[d.location.coordinates[1], d.location.coordinates[0]]}>
                                        <Popup>
                                            <strong>{d.title}</strong><br />
                                            {d.quantity}<br />
                                            <button onClick={() => handleClaim(d._id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs mt-2">Claim</button>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    </div>
                    <div className="w-1/3 overflow-y-auto bg-white p-4 rounded shadow">
                        <h3 className="text-xl font-bold mb-4">Nearby List</h3>
                        {donations.length === 0 ? <p>No donations found nearby.</p> : (
                            donations.map(d => (
                                <div key={d._id} className="border-b py-3">
                                    <h4 className="font-bold">{d.title}</h4>
                                    <p className="text-sm">{d.description}</p>
                                    <p className="text-xs text-gray-500">Expires: {new Date(d.expiryDate).toLocaleString()}</p>
                                    <button onClick={() => handleClaim(d._id)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm w-full">Claim Now</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NGODashboard;
