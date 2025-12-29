import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Bike, MapPin } from "lucide-react";
import axios from 'axios';
import L from "leaflet";
import "leaflet-routing-machine";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const socket = io("http://localhost:5000");

// Routing Component
const RoutingMachine = ({ hotel, ngo, volunteer, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    let waypoints = [];
    if (ngo) {
        // Path from Hotel to NGO
        waypoints = [
            L.latLng(hotel[0], hotel[1]),
            L.latLng(ngo[0], ngo[1]),
        ];
    } else if (volunteer) {
        // Path from Volunteer to Hotel
        waypoints = [
            L.latLng(volunteer[0], volunteer[1]),
            L.latLng(hotel[0], hotel[1]),
        ];
    } else {
         // No route to draw yet, just fit bounds to hotel
         const bounds = L.latLngBounds([hotel]);
         map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
         return;
    }

    // Clean up previous control
    if (routingControlRef.current) {
        try {
            map.removeControl(routingControlRef.current);
        } catch (e) {
            // Ignore removal errors
        }
    }

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      lineOptions: {
        styles: [{ color: '#f97316', opacity: 0.8, weight: 4, dashArray: '10, 10' }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showSearchResults: false,
      show: false, // hide instructions panel
      createMarker: function() { return null; }, // We utilize our own markers
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
        timeout: 30000, 
      })
    }).addTo(map);

    routingControlRef.current = routingControl;

    routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        if (onRouteFound) {
            onRouteFound({
                distance: (summary.totalDistance / 1000).toFixed(1), // km
                time: Math.round(summary.totalTime / 60) // minutes
            });
        }
    });
    
    routingControl.on('routingerror', function(e) {
        console.error("Routing error:", e);
    });

    return () => {
        if (map && routingControlRef.current) {
            try {
                map.removeControl(routingControlRef.current);
            } catch (e) {
                // cleanup
            }
        }
    };
  }, [map, hotel, ngo, volunteer]); // Re-run when these change

  return null;
};

const DonationTrackingMap = ({ donation }) => {
  const [volunteerPos, setVolunteerPos] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // 🔐 SAFETY CHECK
  if (!donation || !donation.location || !donation.location.coordinates) {
    return <p className="text-center">Loading map...</p>;
  }

  // Initial State
  const [initialHotel] = useState([
    donation.location.coordinates[1],
    donation.location.coordinates[0],
  ]);

  const [initialNgo] = useState(
    donation.dropLocation?.coordinates
        ? [donation.dropLocation.coordinates[1], donation.dropLocation.coordinates[0]]
        : donation.claimedBy?.location?.coordinates
            ? [donation.claimedBy.location.coordinates[1], donation.claimedBy.location.coordinates[0]]
            : null
  );

  const [resolvedHotel, setResolvedHotel] = useState(initialHotel);
  const [resolvedNgo, setResolvedNgo] = useState(initialNgo);

  // Geocoding Helper
  const resolveLocation = async (coords, address) => {
    if (Math.abs(coords[0]) > 0.1 || Math.abs(coords[1]) > 0.1) {
        return coords;
    }
    if (!address) return coords;

    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: { q: address, format: 'json', limit: 1 }
        });
        if (res.data && res.data.length > 0) {
            return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
        }
    } catch (e) {
        console.error("Geocoding failed", e);
    }
    return coords;
  };

  // Resolve Effect
  useEffect(() => {
    const resolve = async () => {
        const h = await resolveLocation(initialHotel, donation.donor?.address || (donation.donor?.city ? `${donation.donor.city}, India` : 'India'));
        setResolvedHotel(h);

        if (initialNgo) {
            const n = await resolveLocation(initialNgo, donation.claimedBy?.address);
            setResolvedNgo(n);
        }
    };
    resolve();
  }, []);

  // Socket Listener
  useEffect(() => {
    socket.on("volunteer_location", (data) => {
      if (data.donationId === donation.id) {
        setVolunteerPos([data.lat, data.lng]);
      }
    });
    return () => socket.off("volunteer_location");
  }, [donation.id]);

  // GPS Tracking (Sender)
  useEffect(() => {
    if (donation.status === 'completed' || donation.status === 'available') return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setVolunteerPos([latitude, longitude]);
        try {
            await axios.put(`/api/location/donations/${donation.id}/location`, {
                lat: latitude,
                lng: longitude
            });
        } catch (error) {
            console.error("Error sending location:", error);
        }
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [donation.id, donation.status]);

  return (
    <MapContainer
      center={resolvedHotel}
      zoom={13}
      style={{ height: "500px", width: "100%", borderRadius: "1rem", zIndex: 0 }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      
      <RoutingMachine 
         hotel={resolvedHotel} 
         ngo={resolvedNgo} 
         volunteer={volunteerPos} 
         onRouteFound={setRouteInfo} 
      />

      {routeInfo && (
        <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex flex-col items-end">
            <div className="text-lg font-black text-slate-900">{routeInfo.time} min</div>
            <div className="text-xs font-medium text-slate-500">{routeInfo.distance} km</div>
        </div>
      )}

      <Marker position={resolvedHotel} icon={pointIcon}>
        <Popup className="font-sans">
            <div className="font-bold text-slate-900">Pickup Location</div>
            <div className="text-sm text-slate-600">{donation.donor?.name || 'Restaurant'}</div>
            <div className="text-xs text-slate-500">{donation.donor?.address || 'Address Hidden'}</div>
            {donation.location.coordinates[0] === 0 && <div className="text-[10px] text-orange-500 mt-1">(Location approximated from address)</div>}
        </Popup>
      </Marker>

      {resolvedNgo && (
        <Marker position={resolvedNgo} icon={pointIcon}>
          <Popup className="font-sans">
             <div className="font-bold text-slate-900">Drop Location</div>
             <div className="text-sm text-slate-600">{donation.claimedBy?.name || 'NGO'}</div>
          </Popup>
        </Marker>
      )}

      {volunteerPos && (
        <Marker position={volunteerPos} icon={scooterIcon}>
          <Popup className="font-sans">
             <div className="font-bold text-slate-900">Volunteer</div>
             <div className="text-xs text-slate-500">Live Location</div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

// Icons
const pointIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-md">
      <div className="w-2 h-2 bg-white rounded-full" />
    </div>
  ),
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const scooterIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full shadow-lg border-2 border-white">
      <Bike size={20} />
    </div>
  ),
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default DonationTrackingMap;
