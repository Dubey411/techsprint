import axios from "axios";
import { useEffect } from "react";

const VolunteerTracker = ({ donationId }) => {
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        axios.put(`/api/location/donations/${donationId}/location`, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [donationId]);

  return null;
};

export default VolunteerTracker;
