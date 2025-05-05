import { useState, useEffect } from "react";

const useUserLocation = () => {
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number, lon: number }>({ lat: 0, lon: 0 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => setErrorMessage(error.message),
      { enableHighAccuracy: true }
    );
  }, []);

  return { userCoordinates, errorMessage };
};

export default useUserLocation; // ✅ Ensure it's a default export
