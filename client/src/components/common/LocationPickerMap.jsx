import { useState, useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin } from "lucide-react";

// Draggable Marker Component
const DraggableMarker = ({ position, setPosition }) => {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition({ lat, lng });
        }
      },
    }),
    [setPosition]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    />
  );
};

// Map Events to handle clicks
const LocationMarker = ({ setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return null;
};

const LocationPickerMap = ({ onLocationSelect, initialPosition }) => {
  // Default to Mumbai or somewhere central if no initial pos
  const defaultPos = { lat: 19.076, lng: 72.8777 }; 
  const [position, setPosition] = useState(initialPosition || defaultPos);

  useEffect(() => {
    onLocationSelect(position);
  }, [position, onLocationSelect]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <DraggableMarker position={position} setPosition={setPosition} />
        <LocationMarker setPosition={setPosition} />
    </MapContainer>
  );
};

// Custom Icon
const customIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="flex items-center justify-center w-8 h-8 text-orange-600 -mt-8">
      <MapPin size={32} fill="currentColor" stroke="white" strokeWidth={2} />
    </div>
  ),
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default LocationPickerMap;
