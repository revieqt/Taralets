import { useState, useEffect } from 'react';
import { reverseGeocode } from '../utils/reverseGeocode';

export const useReverseGeocoding = (lat?: number, lon?: number) => {
  const [locationName, setLocationName] = useState('Loading location...');

  useEffect(() => {
    if (lat && lon) {
      reverseGeocode(lat, lon).then(setLocationName);
    }
  }, [lat, lon]);

  return locationName;
};
