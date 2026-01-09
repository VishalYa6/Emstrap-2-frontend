/**
 * Utility functions for geolocation access
 * Handles permissions and error cases
 */

/**
 * Get current user location
 * @returns {Promise<{lat: number, lng: number, address?: string}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Optionally get address from reverse geocoding
        try {
          const address = await reverseGeocode(location.lat, location.lng);
          location.address = address;
        } catch (error) {
          console.warn('Failed to get address:', error);
          // Continue without address
        }

        resolve(location);
      },
      (error) => {
        let errorMessage = 'Location access denied';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Watch user location (for continuous updates)
 * @param {Function} callback - Called with location updates
 * @returns {number} Watch ID for clearing
 */
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 5000 // Use cached position if less than 5 seconds old
  };

  return navigator.geolocation.watchPosition(
    async (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
      };

      try {
        const address = await reverseGeocode(location.lat, location.lng);
        location.address = address;
      } catch (error) {
        console.warn('Failed to get address:', error);
      }

      callback(location);
    },
    (error) => {
      console.error('Error watching location:', error);
    },
    options
  );
};

/**
 * Stop watching location
 * @param {number} watchId - The watch ID returned from watchLocation
 */
export const stopWatchingLocation = (watchId) => {
  if (watchId !== null && watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Reverse geocode coordinates to get address
 * Uses a free geocoding service (you can replace with Google Maps API if needed)
 */
const reverseGeocode = async (lat, lng) => {
  try {
    // Using Nominatim (OpenStreetMap) - free but requires attribution
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'EmSTraP Emergency Platform'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    // Fallback to coordinates if reverse geocoding fails
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Calculate ETA in minutes based on distance
 * Assumes average speed of 50 km/h
 */
export const calculateETA = (distanceKm) => {
  const averageSpeedKmh = 50;
  const etaHours = distanceKm / averageSpeedKmh;
  const etaMinutes = Math.ceil(etaHours * 60);
  return etaMinutes;
};

