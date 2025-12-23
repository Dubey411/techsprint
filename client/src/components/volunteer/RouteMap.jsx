import { useState, useEffect, useCallback, useRef } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import axios from 'axios';
import {
    Navigation,
    MapPin,
    CheckCircle2,
    Truck,
    Clock,
    AlertCircle,
    RotateCcw,
    ChevronRight,
    Search,
    Route,
    Maximize2,
    Layers,
    Navigation2,
    Compass,
    Signal,
    SignalLow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons with animated pulsating effects for current location
const createIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const icons = {
    volunteer: new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div class='marker-pin-volunteer'></div><div class='marker-pulse'></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    }),
    restaurant: createIcon('orange'),
    ngo: createIcon('green'),
    stop: (num) => new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div class='marker-pin-stop'>${num}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    })
};

// Routing Logic Wrapper Component
const RoutingMachine = ({ waypoints, setRouteInfo }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        // Cleanup existing control
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
            waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
            lineOptions: {
                styles: [
                    { color: '#3b82f6', opacity: 0.8, weight: 6 },
                    { color: '#ffffff', opacity: 1, weight: 2, dashArray: '5, 10' }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null // We handle markers manually
        }).addTo(map);

        routingControlRef.current.on('routesfound', (e) => {
            const routes = e.routes;
            const summary = routes[0].summary;
            setRouteInfo({
                distance: (summary.totalDistance / 1000).toFixed(1), // km
                time: Math.round(summary.totalTime / 60), // minutes
                instructions: routes[0].instructions
            });
        });

        return () => {
            if (routingControlRef.current) map.removeControl(routingControlRef.current);
        };
    }, [map, waypoints, setRouteInfo]);

    return null;
};

const MapRecenter = ({ center, isNavMode }) => {
    const map = useMap();
    useEffect(() => {
        if (center && isNavMode) {
            map.flyTo(center, 16, { animate: true, duration: 1.5 });
        }
    }, [center, isNavMode, map]);
    return null;
};

const RouteMap = () => {
    const [tasks, setTasks] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [viewMode, setViewMode] = useState('street'); // street, satellite
    const [isNavMode, setIsNavMode] = useState(false);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0, instructions: [] });
    const [gpsSignal, setGpsSignal] = useState('searching'); // searching, strong, weak

    const fetchTasks = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/donations/tasks');
            setTasks(data);
            if (data.length > 0 && !activeTaskId) {
                setActiveTaskId(data[0]._id);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTaskId]);

    useEffect(() => {
        fetchTasks();

        let watchId;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                    setGpsSignal(pos.coords.accuracy < 20 ? 'strong' : 'weak');
                },
                (err) => {
                    console.error(err);
                    setGpsSignal('lost');
                },
                { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [fetchTasks]);

    const activeTask = tasks.find(t => t._id === activeTaskId);

    // Optimized waypoint calculation logic
    const getWaypoints = () => {
        if (!userLocation) return [];

        let path = [userLocation];

        if (activeTask) {
            const rPos = [activeTask.donor.location.coordinates[1], activeTask.donor.location.coordinates[0]];
            const nPos = activeTask.claimedBy?.location?.coordinates ?
                [activeTask.claimedBy.location.coordinates[1], activeTask.claimedBy.location.coordinates[0]] : null;

            if (activeTask.status === 'claimed') {
                path.push(rPos);
                if (nPos) path.push(nPos);
            } else if (activeTask.status === 'picked_up') {
                if (nPos) path.push(nPos);
            }
        }

        return path;
    };

    const waypoints = getWaypoints();

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`/api/donations/${id}/status`, { status });
            fetchTasks();
        } catch (error) {
            console.error("Status update failed:", error);
        }
    };

    return (
        <div className={`flex flex-col relative bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl transition-all duration-500 ${isNavMode ? 'h-screen fixed inset-0 z-[100] rounded-none' : 'h-[calc(100vh-140px)]'}`}>

            {/* Mission Control Panel (Mission Statistics) */}
            <AnimatePresence>
                {!isNavMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute bottom-10 inset-x-10 z-[1000] pointer-events-none"
                    >
                        <div className="max-w-4xl mx-auto flex items-stretch gap-4 pointer-events-auto">
                            <div className="flex-1 bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/50 shadow-2xl flex items-center justify-between overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Route className="h-24 w-24" />
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <Navigation2 className="h-8 w-8 animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Estimated Distance</p>
                                        <h4 className="text-3xl font-black text-slate-900">{routeInfo.distance} <span className="text-base text-slate-400 font-bold uppercase">km</span></h4>
                                    </div>
                                    <div className="h-12 w-[1px] bg-slate-200"></div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Time to Target</p>
                                        <h4 className="text-3xl font-black text-slate-900">{routeInfo.time} <span className="text-base text-slate-400 font-bold uppercase">min</span></h4>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">GPS Status</p>
                                        <div className="flex items-center gap-2 justify-end">
                                            {gpsSignal === 'strong' ? (
                                                <span className="flex items-center text-emerald-600 font-black text-xs uppercase tracking-tighter">
                                                    <Signal className="h-3.5 w-3.5 mr-1" /> Precision Locked
                                                </span>
                                            ) : gpsSignal === 'weak' ? (
                                                <span className="flex items-center text-orange-500 font-black text-xs uppercase tracking-tighter">
                                                    <SignalLow className="h-3.5 w-3.5 mr-1" /> Standard Link
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-red-500 font-black text-xs uppercase tracking-tighter animate-pulse">
                                                    <RotateCcw className="h-3.5 w-3.5 mr-1 animate-spin" /> Searching...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsNavMode(!isNavMode)}
                                className="w-20 bg-slate-900 text-white rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                            >
                                <Maximize2 className="h-6 w-6" />
                                <span className="text-[8px] font-black uppercase tracking-widest">EXPAND</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Side Navigation Control (Mobile First) */}
            <div className={`absolute top-10 right-10 z-[1000] flex flex-col gap-4 transition-all duration-300 ${isNavMode ? 'opacity-40 hover:opacity-100 scale-110' : ''}`}>
                <div className="bg-white/90 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white/50 flex flex-col gap-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'street' ? 'satellite' : 'street')}
                        className={`p-4 rounded-full transition-all ${viewMode === 'satellite' ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-500'}`}
                    >
                        <Layers className="h-6 w-6" />
                    </button>
                    <button className="p-4 rounded-full hover:bg-slate-50 text-slate-500">
                        <Compass className="h-6 w-6" />
                    </button>
                    <div className="h-[1px] bg-slate-100 mx-2"></div>
                    <button
                        onClick={() => setIsNavMode(!isNavMode)}
                        className={`p-4 rounded-full transition-all ${isNavMode ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-50 text-slate-500'}`}
                    >
                        {isNavMode ? <Navigation className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Active Mission HUD (Top Left) */}
            <AnimatePresence>
                {activeTask && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-10 left-10 z-[1000] w-full max-w-sm pointer-events-none"
                    >
                        <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 pointer-events-auto overflow-hidden relative">
                            {activeTask.status === 'claimed' ? (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-3xl uppercase tracking-widest">
                                    Stage 1: Pickup
                                </div>
                            ) : (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-3xl uppercase tracking-widest text-shadow-sm">
                                    Stage 2: Delivery
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tighter">{activeTask.title}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Target: {activeTask.status === 'claimed' ? activeTask.donor.name : activeTask.claimedBy?.name}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <div className="h-10 w-10 shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                                        <div className={`w-3 h-3 rounded-full ${activeTask.status === 'claimed' ? 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]' : 'bg-slate-300'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Origin / Pickup</p>
                                        <p className="text-xs font-bold text-slate-900 leading-tight">{activeTask.donor.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                                    <div className="h-10 w-10 shrink-0 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                                        <div className={`w-3 h-3 rounded-full ${activeTask.status === 'picked_up' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Drop-off Hub</p>
                                        <p className="text-xs font-bold text-slate-900 leading-tight">{activeTask.claimedBy?.address || 'Calculating...'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                {activeTask.status === 'claimed' ? (
                                    <button
                                        onClick={() => handleUpdateStatus(activeTask._id, 'picked_up')}
                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                                    >
                                        Confirm Pickup <Truck className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateStatus(activeTask._id, 'completed')}
                                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                                    >
                                        Complete Mission <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map Area */}
            <div className="flex-1 relative z-10 w-full">
                <MapContainer
                    center={userLocation || [28.6139, 77.2090]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url={viewMode === 'street'
                            ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{y}/{x}/{z}"
                        }
                        attribution='&copy; TechSpark Mission Control'
                        className={isNavMode ? 'contrast-125 saturate-150 grayscale-20' : ''}
                    />

                    <ZoomControl position="bottomright" />
                    <MapRecenter center={userLocation} isNavMode={isNavMode} />
                    <RoutingMachine waypoints={waypoints} setRouteInfo={setRouteInfo} />

                    {/* Markers */}
                    {userLocation && (
                        <Marker position={userLocation} icon={icons.volunteer}>
                            <Popup>Volunteer Vector</Popup>
                        </Marker>
                    )}

                    {activeTask && (
                        <>
                            <Marker
                                position={[activeTask.donor.location.coordinates[1], activeTask.donor.location.coordinates[0]]}
                                icon={icons.restaurant}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <p className="font-black text-slate-900 uppercase text-[10px]">{activeTask.donor.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">PICKUP POINT</p>
                                    </div>
                                </Popup>
                            </Marker>

                            {activeTask.claimedBy?.location && (
                                <Marker
                                    position={[activeTask.claimedBy.location.coordinates[1], activeTask.claimedBy.location.coordinates[0]]}
                                    icon={icons.ngo}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-black text-slate-900 uppercase text-[10px]">{activeTask.claimedBy.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">DISTRIBUTION HUB</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </>
                    )}
                </MapContainer>
            </div>

            {/* Dynamic CSS for Pulsating Marker and Stop Pins */}
            <style>{`
                .marker-pin-volunteer {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 3px solid #fff;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                }
                .marker-pulse {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(59, 130, 246, 0.4);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                }
                .marker-pin-stop {
                    width: 24px;
                    height: 24px;
                    background: #1e293b;
                    border: 2px solid white;
                    border-radius: 8px;
                    color: white;
                    font-size: 10px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }
                .leaflet-routing-container {
                    display: none !important;
                }
            `}</style>

            {/* Safety & Navigation Footer */}
            <div className={`p-6 bg-white border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isNavMode ? 'translate-y-full opacity-0 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Safety Advisory</h5>
                        <p className="text-[10px] font-medium text-slate-500 max-w-sm">Do not operate terminal while in transit. Mission tracking is hands-free by default.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="px-5 py-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Radar Active</span>
                    </div>
                    {tasks.length > 1 && (
                        <div className="px-5 py-3 bg-blue-50 rounded-2xl flex items-center gap-3 border border-blue-100">
                            <Route className="h-4 w-4 text-blue-600" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{tasks.length} Multi-Stops</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RouteMap;
