import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { motion } from 'framer-motion';
import LocalTaxiRoundedIcon from '@mui/icons-material/LocalTaxiRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { useAmbulanceStore } from '../../../stores/ambulanceStore';
import { useAuthStore } from '../../../stores/authStore';
import { 
  subscribeToPendingEmergencies, 
  acceptEmergency, 
  updateAmbulanceLocation,
  subscribeToCompletedTrips,
  updateEmergencyStatus
} from '../../../services/emergencyService';
import { watchLocation, stopWatchingLocation } from '../../../utils/locationUtils';
import { MapPanel } from '../../common/MapPanel';
import { Timeline } from '../../common/Timeline';
import { StatusChip } from '../../common/StatusChip';

const quickActions = [
  'On the Way',
  'Arrived at Scene',
  'Patient Picked Up',
  'At Hospital',
  'Trip Complete',
];

export const AmbulanceDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [pendingEmergencies, setPendingEmergencies] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [isAccepting, setIsAccepting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [locationWatchId, setLocationWatchId] = useState(null);
  
  // ✅ FIXED: Select state individually to prevent infinite loops
  const nearbyRequests = useAmbulanceStore((state) => state.nearbyRequests);
  const acceptRequest = useAmbulanceStore((state) => state.acceptRequest);
  const rejectRequest = useAmbulanceStore((state) => state.rejectRequest);
  const activeRide = useAmbulanceStore((state) => state.activeRide);
  const timeline = useAmbulanceStore((state) => state.timeline);
  const updateRideStatus = useAmbulanceStore((state) => state.updateRideStatus);

  // Real-time listener for pending emergencies
  useEffect(() => {
    const unsubscribe = subscribeToPendingEmergencies(
      (emergencies) => {
        setPendingEmergencies(emergencies);
        // Also update the store for compatibility
        useAmbulanceStore.setState({ nearbyRequests: emergencies.map(e => ({
          id: e.id,
          type: e.type,
          patient: e.userEmail || 'Unknown',
          distance: `${Math.random() * 5 + 2} km`,
          urgency: e.type === 'SOS' ? 'high' : 'medium'
        })) });
      },
      (error) => {
        console.error('Error listening to emergencies:', error);
        setSnackbar({
          open: true,
          message: 'Error loading emergencies',
          severity: 'error'
        });
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener for completed trips
  useEffect(() => {
    const driverId = user?.id || 'driver-123';
    if (!driverId) return;

    const unsubscribe = subscribeToCompletedTrips(
      driverId,
      (trips) => {
        setCompletedTrips(trips);
      },
      (error) => {
        console.error('Error loading completed trips:', error);
      },
      10
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Start GPS tracking when an emergency is accepted
  useEffect(() => {
    if (activeEmergency && !locationWatchId) {
      const watchId = watchLocation((location) => {
        // Update ambulance location in Firestore
        if (activeEmergency.ambulanceDetails?.ambulanceId) {
          updateAmbulanceLocation(
            activeEmergency.ambulanceDetails.ambulanceId,
            location
          ).catch(console.error);
        }
      });
      setLocationWatchId(watchId);
    }

    return () => {
      if (locationWatchId) {
        stopWatchingLocation(locationWatchId);
      }
    };
  }, [activeEmergency]);

  const handleAcceptEmergency = async (emergencyId) => {
    setIsAccepting(true);
    try {
      const emergency = pendingEmergencies.find(e => e.id === emergencyId);
      if (!emergency) {
        throw new Error('Emergency not found');
      }

      // Get driver info from user store
      const driverInfo = {
        driverId: user?.id || 'driver-123',
        name: user?.name || 'Driver Name',
        phone: user?.phone || '+91 00000 00000'
      };

      const ambulanceDetails = {
        ambulanceId: `amb-${user?.id || 'default'}`,
        vehicleNumber: 'DL 10 AB 4321',
        type: emergency.ambulanceType || 'Basic Life Support'
      };

      // Accept emergency in Firebase
      await acceptEmergency(emergencyId, driverInfo, ambulanceDetails);

      // Update local state
      const acceptedEmergency = { ...emergency, status: 'accepted', driverInfo, ambulanceDetails };
      setActiveEmergency(acceptedEmergency);
      setPendingEmergencies(prev => prev.filter(e => e.id !== emergencyId));

      setSnackbar({
        open: true,
        message: 'Emergency accepted! Start navigating to the location.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error accepting emergency:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to accept emergency',
        severity: 'error'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectEmergency = (emergencyId) => {
    setPendingEmergencies(prev => prev.filter(e => e.id !== emergencyId));
    rejectRequest(emergencyId);
  };

  const handleUpdateStatus = async (action) => {
    if (!activeEmergency?.id) {
      // Update local store only if no active emergency
      updateRideStatus(action);
      return;
    }

    try {
      // Map action to Firebase status
      const statusMap = {
        'On the Way': 'enRoute',
        'Arrived at Scene': 'arrived',
        'Patient Picked Up': 'pickedUp',
        'At Hospital': 'atHospital',
        'Trip Complete': 'completed'
      };

      const newStatus = statusMap[action] || action.toLowerCase();
      
      // Update in Firebase
      await updateEmergencyStatus(activeEmergency.id, newStatus);

      // Update local state
      if (newStatus === 'completed') {
        setActiveEmergency(null);
        setSnackbar({
          open: true,
          message: 'Trip marked as completed!',
          severity: 'success'
        });
      } else {
        setActiveEmergency(prev => prev ? { ...prev, status: newStatus } : null);
      }

      // Also update local store for compatibility
      updateRideStatus(action);
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Grid container spacing={3}>
      {/* ✅ FIXED: Grid v2 syntax (size={{ ... }}) */}
      <Grid size={{ xs: 12, xl: 8 }}>
        <MapPanel
          title="Operational map"
          height={420}
          markers={[
            { id: 'ambulance', x: 46, y: 38, label: 'A', color: '#3B82F6' },
            { id: 'req1', x: 64, y: 52, label: 'R', color: '#DC2626' },
            { id: 'req2', x: 28, y: 62, label: 'R', color: '#DC2626' },
          ]}
          activeMarker="ambulance"
        >
          <Chip label="Navigation assist" color="primary" icon={<NavigationRoundedIcon />} />
        </MapPanel>
      </Grid>
      
      <Grid size={{ xs: 12, xl: 4 }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                New requests
              </Typography>
              <Chip label={`${nearbyRequests.length} active`} color="error" />
            </Stack>
            <Stack spacing={2}>
              {pendingEmergencies.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No pending emergencies
                </Typography>
              ) : (
                pendingEmergencies.map((req) => (
                  <Card
                    key={req.id}
                    variant="outlined"
                    component={motion.div}
                    whileHover={{ scale: 1.01 }}
                    sx={{ borderRadius: 3, borderColor: 'divider' }}
                  >
                    <CardContent>
                      <Typography fontWeight={700}>{req.type}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {req.userEmail || 'Unknown User'} • {req.location?.address || 'Location unknown'}
                      </Typography>
                      {req.photoURL && req.type === 'SOS' && (
                        <Chip
                          label="Photo Available"
                          color="error"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                      <Chip
                        label={`${req.type === 'SOS' ? 'HIGH' : 'MEDIUM'} urgency`}
                        color="error"
                        size="small"
                        sx={{ mt: 1, ml: 1 }}
                      />
                      <Stack direction="row" spacing={2} mt={2}>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          startIcon={<CheckRoundedIcon />} 
                          onClick={() => handleAcceptEmergency(req.id)}
                          disabled={isAccepting}
                        >
                          I'm Responding
                        </Button>
                        <Button 
                          fullWidth 
                          variant="outlined" 
                          startIcon={<CloseRoundedIcon />} 
                          onClick={() => handleRejectEmergency(req.id)}
                          disabled={isAccepting}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid id="active" size={{ xs: 12, xl: 6 }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                Active ride
              </Typography>
              {activeRide ? <StatusChip label={activeRide.status} /> : null}
            </Stack>
            <Divider sx={{ my: 2 }} />
            {activeEmergency || activeRide ? (
              <Stack spacing={2}>
                <Typography>
                  {activeEmergency?.userEmail || activeRide?.patient} • {activeEmergency?.location?.address || activeRide?.distance} • {activeEmergency?.type || activeRide?.type}
                </Typography>
                {activeEmergency && (
                  <Typography variant="body2" color="text.secondary">
                    Status: {activeEmergency.status}
                  </Typography>
                )}
                <Timeline items={timeline} activeIndex={timeline.length - 1} />
              </Stack>
            ) : (
              <Typography color="text.secondary">Waiting for acceptance...</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, xl: 6 }} position="relative">
        <Card
          variant="outlined"
          sx={{
            borderRadius: 4,
            backgroundImage:
              'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(59,130,246,0.7))',
            color: '#fff',
          }}
        >
          <CardContent>
            <Typography variant="h5" fontWeight={700}>
              Quick actions
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Update the dispatch center with one tap
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={2} mt={3}>
              {quickActions.map((action) => (
                <Button
                  key={action}
                  onClick={() => handleUpdateStatus(action)}
                  variant="contained"
                  color="secondary"
                  endIcon={<DoneAllRoundedIcon />}
                >
                  {action}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
        <Tooltip title="Crew status">
          <Fab
            color="error"
            sx={{ position: 'absolute', bottom: -24, right: 24 }}
            aria-label="crew status"
          >
            <LocalTaxiRoundedIcon />
          </Fab>
        </Tooltip>
      </Grid>

      {/* Completed Trips Section */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Completed Trips
              </Typography>
              <Chip label={`${completedTrips.length} trips`} color="success" />
            </Stack>
            {completedTrips.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No completed trips yet
              </Typography>
            ) : (
              <Stack spacing={2}>
                {completedTrips.map((trip) => (
                  <Card key={trip.id} variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <div>
                          <Typography fontWeight={700}>{trip.type}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {trip.userEmail || 'Unknown User'} • {trip.location?.address || 'Location unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Completed: {new Date(trip.createdAt || trip.timestamp?.toDate?.() || Date.now()).toLocaleString()}
                          </Typography>
                        </div>
                        <StatusChip label={trip.status} />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};
