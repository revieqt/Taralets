import { useEffect, useState } from 'react';
import { wikipediaService } from '@/services/wikipediaService';

export const usePlaceInformation = (place: string) => {
  const [info, setInfo] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (place && place !== 'Unknown location' && place !== 'Loading location...') {
      setLoading(true);
      Promise.all([
        wikipediaService.getInfo(place),
        wikipediaService.getImage(place)
      ]).then(([infoResult, imageResult]) => {
        if (isMounted) {
          setInfo(infoResult);
          setImage(imageResult);
          setLoading(false);
        }
      });
    } else {
      setInfo(null);
      setImage(null);
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [place]);

  return { info, image, loading };
};