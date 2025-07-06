const GOOGLE_API_KEY = 'AIzaSyDI_dL8xl7gnjcPps-CXgDJM9DtF3oZPVI'; // Replace or load from env/config

/**
 * Get coordinates from a place name using Google Places API
 */
export async function getPlaceCoordinates(placeName: string) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    placeName
  )}&inputtype=textquery&fields=geometry&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error(`No coordinates found for "${placeName}"`);
  }

  const location = data.candidates[0].geometry.location;

  return {
    latitude: location.lat,
    longitude: location.lng,
  };
}

/**
 * Convert an array of location names into route format for Firestore
 */
export async function convertLocationsToRouteJson(
  locations: { locationName: string }[],
  userID: string
) {
  const result = await Promise.all(
    locations.map(async (loc) => {
      const coords = await getPlaceCoordinates(loc.locationName);
      return {
        ...coords,
        locationName: loc.locationName,
      };
    })
  );

  return {
    createdOn: new Date(),
    status: 'forLater',
    userID,
    location: result,
  };
}
