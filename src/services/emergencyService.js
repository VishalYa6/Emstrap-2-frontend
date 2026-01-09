import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  getDoc,
  orderBy,
  limit,
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';

/**
 * Task 1: SOS Emergency Function
 * Captures photo, uploads to Firebase Storage, and creates emergency document
 */
export const createSOSEmergency = async (photoFile, location) => {
  try {
    // 1. Upload photo to Firebase Storage
    const photoRef = ref(storage, `sos-photos/${Date.now()}_${photoFile.name}`);
    const uploadResult = await uploadBytes(photoRef, photoFile);
    const photoURL = await getDownloadURL(uploadResult.ref);

    // 2. Create GeoPoint from location coordinates
    const geopoint = new GeoPoint(location.lat, location.lng);

    // 3. Create emergency document in Firestore
    const emergencyRef = await addDoc(collection(db, 'emergencies'), {
      type: 'SOS',
      status: 'pending',
      geopoint: geopoint,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || null
      },
      photoURL: photoURL,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      userId: auth.currentUser?.uid || null,
      userEmail: auth.currentUser?.email || null
    });

    return {
      success: true,
      emergencyId: emergencyRef.id,
      photoURL
    };
  } catch (error) {
    console.error('Error creating SOS emergency:', error);
    throw new Error(`Failed to create SOS emergency: ${error.message}`);
  }
};

/**
 * Task 1: Book Ambulance Function
 * Creates an ambulance booking document
 */
export const createAmbulanceBooking = async (bookingData, location) => {
  try {
    // Create GeoPoint from location
    const geopoint = new GeoPoint(location.lat, location.lng);

    // Create booking document
    const bookingRef = await addDoc(collection(db, 'emergencies'), {
      type: 'Ambulance',
      status: 'pending',
      geopoint: geopoint,
      location: {
        lat: location.lat,
        lng: location.lng,
        pickup: bookingData.pickup,
        destination: bookingData.destination || null
      },
      emergencyType: bookingData.emergencyType,
      ambulanceType: bookingData.ambulanceType,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      userId: auth.currentUser?.uid || null,
      userEmail: auth.currentUser?.email || null,
      patientInfo: bookingData.patientInfo || null
    });

    return {
      success: true,
      bookingId: bookingRef.id
    };
  } catch (error) {
    console.error('Error creating ambulance booking:', error);
    throw new Error(`Failed to create booking: ${error.message}`);
  }
};

/**
 * Task 2: Listen for pending emergencies (Ambulance Dashboard)
 */
export const subscribeToPendingEmergencies = (callback, errorCallback) => {
  const q = query(
    collection(db, 'emergencies'),
    where('status', '==', 'pending'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const emergencies = [];
      snapshot.forEach((doc) => {
        emergencies.push({
          id: doc.id,
          ...doc.data(),
          geopoint: doc.data().geopoint
            ? {
                lat: doc.data().geopoint.latitude,
                lng: doc.data().geopoint.longitude
              }
            : null
        });
      });
      callback(emergencies);
    },
    (error) => {
      console.error('Error listening to emergencies:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

/**
 * Task 2: Accept emergency request (Ambulance Dashboard)
 */
export const acceptEmergency = async (emergencyId, driverInfo, ambulanceDetails) => {
  try {
    const emergencyRef = doc(db, 'emergencies', emergencyId);
    
    await updateDoc(emergencyRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      driverId: driverInfo.driverId || auth.currentUser?.uid,
      driverInfo: {
        name: driverInfo.name,
        phone: driverInfo.phone,
        vehicleNumber: ambulanceDetails.vehicleNumber,
        ambulanceId: ambulanceDetails.ambulanceId
      },
      ambulanceDetails: ambulanceDetails
    });

    return { success: true };
  } catch (error) {
    console.error('Error accepting emergency:', error);
    throw new Error(`Failed to accept emergency: ${error.message}`);
  }
};

/**
 * Update emergency status (for status updates like "Trip Complete")
 */
export const updateEmergencyStatus = async (emergencyId, status, additionalData = {}) => {
  try {
    const emergencyRef = doc(db, 'emergencies', emergencyId);
    
    await updateDoc(emergencyRef, {
      status: status,
      updatedAt: serverTimestamp(),
      ...additionalData
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating emergency status:', error);
    throw new Error(`Failed to update status: ${error.message}`);
  }
};

/**
 * Task 2: Update ambulance GPS location (Background process)
 */
export const updateAmbulanceLocation = async (ambulanceId, location) => {
  try {
    const ambulanceRef = doc(db, 'ambulances', ambulanceId);
    const geopoint = new GeoPoint(location.lat, location.lng);

    await updateDoc(ambulanceRef, {
      currentLocation: {
        geopoint: geopoint,
        lat: location.lat,
        lng: location.lng,
        timestamp: serverTimestamp()
      },
      lastUpdated: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating ambulance location:', error);
    throw new Error(`Failed to update location: ${error.message}`);
  }
};

/**
 * Task 3: Subscribe to all active emergencies (Hospital Dashboard)
 * Note: Using multiple queries instead of 'in' operator to avoid composite index requirement
 */
export const subscribeToActiveEmergencies = (callback, errorCallback) => {
  // Listen to multiple status queries and merge results
  const statuses = ['pending', 'accepted', 'enRoute', 'arrived'];
  const unsubscribes = [];
  const allEmergencies = new Map();

  const processSnapshot = (snapshot, status) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      allEmergencies.set(doc.id, {
        id: doc.id,
        ...data,
        status: status,
        geopoint: data.geopoint
          ? {
              lat: data.geopoint.latitude,
              lng: data.geopoint.longitude
            }
          : null
      });
    });
    
    // Convert map to array and sort by timestamp
    const emergenciesArray = Array.from(allEmergencies.values()).sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(a.createdAt || 0);
      const timeB = b.timestamp?.toDate?.() || new Date(b.createdAt || 0);
      return timeB - timeA;
    });
    
    callback(emergenciesArray);
  };

  statuses.forEach((status) => {
    const q = query(
      collection(db, 'emergencies'),
      where('status', '==', status),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => processSnapshot(snapshot, status),
      (error) => {
        console.error(`Error listening to ${status} emergencies:`, error);
        if (errorCallback) errorCallback(error);
      }
    );
    
    unsubscribes.push(unsubscribe);
  });

  // Return a function that unsubscribes all listeners
  return () => {
    unsubscribes.forEach(unsubscribe => unsubscribe());
  };
};

/**
 * Task 3: Subscribe to SOS emergencies only (Police Dashboard)
 */
export const subscribeToSOSEmergencies = (callback, errorCallback) => {
  // Filter by type first, then filter active statuses in memory
  const q = query(
    collection(db, 'emergencies'),
    where('type', '==', 'SOS'),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const emergencies = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter active statuses in memory
        if (['pending', 'accepted', 'responded'].includes(data.status)) {
          emergencies.push({
            id: doc.id,
            ...data,
            geopoint: data.geopoint
              ? {
                  lat: data.geopoint.latitude,
                  lng: data.geopoint.longitude
                }
              : null
          });
        }
      });
      callback(emergencies);
    },
    (error) => {
      console.error('Error listening to SOS emergencies:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

/**
 * Task 3: Get ambulance ETA and status for a specific emergency
 */
export const getAmbulanceStatus = async (ambulanceId) => {
  try {
    const ambulanceRef = doc(db, 'ambulances', ambulanceId);
    const ambulanceSnap = await getDoc(ambulanceRef);
    
    if (ambulanceSnap.exists()) {
      return {
        ...ambulanceSnap.data(),
        id: ambulanceSnap.id
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting ambulance status:', error);
    throw error;
  }
};

/**
 * Task 4: Subscribe to assigned ambulance location (User Dashboard - Tracking)
 */
export const subscribeToAmbulanceLocation = (ambulanceId, callback, errorCallback) => {
  const ambulanceRef = doc(db, 'ambulances', ambulanceId);

  return onSnapshot(
    ambulanceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          id: snapshot.id,
          ...data,
          currentLocation: data.currentLocation?.geopoint
            ? {
                lat: data.currentLocation.geopoint.latitude,
                lng: data.currentLocation.geopoint.longitude
              }
            : data.currentLocation
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to ambulance location:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

/**
 * Task 4: Get active emergency for user (to find assigned ambulance)
 */
export const subscribeToUserActiveEmergency = (userId, callback, errorCallback) => {
  const q = query(
    collection(db, 'emergencies'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(10)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      // Find the most recent active emergency
      const activeStatuses = ['pending', 'accepted', 'enRoute', 'arrived'];
      let activeEmergency = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (activeStatuses.includes(data.status) && !activeEmergency) {
          activeEmergency = {
            id: doc.id,
            ...data,
            geopoint: data.geopoint
              ? {
                  lat: data.geopoint.latitude,
                  lng: data.geopoint.longitude
                }
              : null
          };
        }
      });
      
      callback(activeEmergency);
    },
    (error) => {
      console.error('Error listening to user emergency:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

/**
 * Task 3: Admin - Subscribe to all emergencies for map view
 */
export const subscribeToAllEmergencies = (callback, errorCallback) => {
  const q = query(
    collection(db, 'emergencies'),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const emergencies = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        emergencies.push({
          id: doc.id,
          ...data,
          geopoint: data.geopoint
            ? {
                lat: data.geopoint.latitude,
                lng: data.geopoint.longitude
              }
            : null
        });
      });
      callback(emergencies);
    },
    (error) => {
      console.error('Error listening to all emergencies:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

/**
 * Task 3: Admin - Subscribe to all active ambulances for map view
 */
export const subscribeToAllAmbulances = (callback, errorCallback) => {
  const q = query(
    collection(db, 'ambulances'),
    where('status', '==', 'active')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const ambulances = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ambulances.push({
          id: doc.id,
          ...data,
          currentLocation: data.currentLocation?.geopoint
            ? {
                lat: data.currentLocation.geopoint.latitude,
                lng: data.currentLocation.geopoint.longitude
              }
            : data.currentLocation
        });
      });
      callback(ambulances);
    },
    (error) => {
      console.error('Error listening to ambulances:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

/**
 * Subscribe to completed trips for a specific ambulance driver
 */
export const subscribeToCompletedTrips = (driverId, callback, errorCallback, limitCount = 20) => {
  // Query for completed emergencies where this driver accepted
  const q = query(
    collection(db, 'emergencies'),
    where('status', '==', 'completed'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const trips = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter for trips where this driver is assigned
        if (data.driverId === driverId || data.ambulanceDetails?.ambulanceId === `amb-${driverId}`) {
          trips.push({
            id: doc.id,
            ...data,
            geopoint: data.geopoint
              ? {
                  lat: data.geopoint.latitude,
                  lng: data.geopoint.longitude
                }
              : null
          });
        }
      });
      callback(trips);
    },
    (error) => {
      console.error('Error listening to completed trips:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

/**
 * Task 3: Admin - Get completed emergencies history
 */
export const subscribeToEmergencyHistory = (callback, errorCallback, limitCount = 50) => {
  const q = query(
    collection(db, 'emergencies'),
    where('status', '==', 'completed'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const history = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
          geopoint: data.geopoint
            ? {
                lat: data.geopoint.latitude,
                lng: data.geopoint.longitude
              }
            : null
        });
      });
      callback(history);
    },
    (error) => {
      console.error('Error listening to emergency history:', error);
      if (errorCallback) errorCallback(error);
    }
  );
};

