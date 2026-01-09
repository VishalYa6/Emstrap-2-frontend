import { useState, useEffect } from 'react'; // ✅ Added missing import
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalPoliceRoundedIcon from '@mui/icons-material/LocalPoliceRounded';

import { usePoliceStore } from '../../../stores/policeStore';
import { subscribeToSOSEmergencies, getAmbulanceStatus } from '../../../services/emergencyService';
import { MapPanel } from '../../common/MapPanel';
import { StatusChip } from '../../common/StatusChip';

export const PoliceDashboard = () => {
  // ✅ FIXED: Individual selectors to prevent infinite loop crash
  const incidents = usePoliceStore((state) => state.incidents);
  const filterOptions = usePoliceStore((state) => state.filterOptions);
  const activeFilter = usePoliceStore((state) => state.activeFilter);
  const setFilter = usePoliceStore((state) => state.setFilter);
  const markIncident = usePoliceStore((state) => state.markIncident);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [sosEmergencies, setSosEmergencies] = useState([]);
  const [ambulanceDetails, setAmbulanceDetails] = useState(null);

  // Real-time listener for SOS emergencies only
  useEffect(() => {
    const unsubscribe = subscribeToSOSEmergencies(
      (emergencies) => {
        setSosEmergencies(emergencies);
        // Also update the store for compatibility
        usePoliceStore.setState({ 
          incidents: emergencies.map(e => ({
            id: e.id,
            title: 'SOS Emergency',
            location: e.location?.address || `${e.geopoint?.lat?.toFixed(4)}, ${e.geopoint?.lng?.toFixed(4)}`,
            time: new Date(e.createdAt || e.timestamp?.toDate?.() || Date.now()).toLocaleTimeString(),
            status: e.status === 'pending' ? 'Open' : e.status === 'accepted' ? 'Responding' : 'Closed',
            severity: 'high',
            photoURL: e.photoURL,
            geopoint: e.geopoint
          }))
        });
      },
      (error) => {
        console.error('Error listening to SOS emergencies:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" fontWeight={800}>
            Police Dispatch
          </Typography>
          <Typography color="text.secondary">
            Active incident monitoring and response coordination
          </Typography>
        </div>
        <Button
          variant="contained"
          color="error"
          startIcon={<LocalPoliceRoundedIcon />}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          Report Incident
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* ✅ FIXED: Grid v2 syntax (size={{ ... }}) */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <MapPanel
            title="Active SOS Incidents Map"
            markers={sosEmergencies.map((emergency, index) => ({
              id: emergency.id,
              x: emergency.geopoint?.lat ? ((emergency.geopoint.lat - 28.4) * 100) : 20 + index * 20,
              y: emergency.geopoint?.lng ? ((emergency.geopoint.lng - 77.0) * 100) : 30 + index * 10,
              label: index + 1,
              color: '#DC2626',
            }))}
            activeMarker={sosEmergencies[0]?.id}
          >
            <Stack direction="row" spacing={1} mt={2}>
              {filterOptions.map((filter) => (
                <Chip
                  key={filter}
                  label={filter}
                  onClick={() => setFilter(filter)}
                  color={activeFilter === filter ? 'primary' : 'default'}
                  variant={activeFilter === filter ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 500 }}
                />
              ))}
            </Stack>
          </MapPanel>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Incident Feed
              </Typography>
              <Stack spacing={0}>
                {sosEmergencies.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No active SOS emergencies
                  </Typography>
                ) : (
                  sosEmergencies.map((emergency, index) => {
                    const incident = incidents.find(i => i.id === emergency.id) || {
                      id: emergency.id,
                      title: 'SOS Emergency',
                      location: emergency.location?.address || 'Location unknown',
                      time: new Date(emergency.createdAt || emergency.timestamp?.toDate?.() || Date.now()).toLocaleTimeString(),
                      status: emergency.status === 'pending' ? 'Open' : emergency.status === 'accepted' ? 'Responding' : 'Closed',
                      photoURL: emergency.photoURL,
                      geopoint: emergency.geopoint
                    };
                    return (
                      <div key={emergency.id}>
                        <Box
                          onClick={async () => {
                            const incidentData = { ...incident, ...emergency };
                            setSelectedIncident(incidentData);
                            
                            // Fetch ambulance details if emergency is accepted
                            if (emergency.status === 'accepted' && emergency.ambulanceDetails?.ambulanceId) {
                              try {
                                const ambulance = await getAmbulanceStatus(emergency.ambulanceDetails.ambulanceId);
                                setAmbulanceDetails(ambulance);
                              } catch (error) {
                                console.error('Error fetching ambulance details:', error);
                                setAmbulanceDetails(null);
                              }
                            } else {
                              setAmbulanceDetails(null);
                            }
                          }}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: selectedIncident?.id === emergency.id ? 'action.selected' : 'transparent',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography fontWeight={700}>
                              {index + 1}. {incident.title}
                            </Typography>
                            <StatusChip label={incident.status} />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {incident.location} • {incident.time}
                          </Typography>
                          {emergency.photoURL && (
                            <Chip label="Photo Available" size="small" color="error" sx={{ mt: 1 }} />
                          )}
                        </Box>
                        {index < sosEmergencies.length - 1 && <Divider />}
                      </div>
                    );
                  })
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        PaperProps={{ sx: { width: 400, p: 3 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={800}>
            Incident details
          </Typography>
          <IconButton onClick={() => {
            setSelectedIncident(null);
            setAmbulanceDetails(null);
          }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        {selectedIncident ? (
          <Stack spacing={3}>
            <Box p={2} bgcolor="error.lighter" borderRadius={3} color="error.dark">
              <Typography variant="subtitle2" fontWeight={700}>CRITICAL ALERT</Typography>
              <Typography variant="body2">
                Requires immediate patrol unit dispatch.
              </Typography>
            </Box>
            
            <div>
              <Typography variant="caption" color="text.secondary">INCIDENT TYPE</Typography>
              <Typography variant="h6">{selectedIncident.title || 'SOS Emergency'}</Typography>
            </div>

            <div>
              <Typography variant="caption" color="text.secondary">LOCATION</Typography>
              <Typography variant="h6">{selectedIncident.location || 'Location unknown'}</Typography>
              {selectedIncident.geopoint && (
                <Typography variant="body2" color="text.secondary">
                  {selectedIncident.geopoint.lat?.toFixed(6)}, {selectedIncident.geopoint.lng?.toFixed(6)}
                </Typography>
              )}
            </div>

            {/* Display captured photo */}
            {selectedIncident.photoURL && (
              <div>
                <Typography variant="caption" color="text.secondary" gutterBottom>CAPTURED PHOTO</Typography>
                <Box
                  component="img"
                  src={selectedIncident.photoURL}
                  alt="SOS Emergency Photo"
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    mt: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
              </div>
            )}

            {/* Display ambulance details if emergency is accepted */}
            {selectedIncident.status === 'accepted' && (ambulanceDetails || selectedIncident.ambulanceDetails || selectedIncident.driverInfo) && (
              <div>
                <Typography variant="caption" color="text.secondary" gutterBottom>AMBULANCE DETAILS</Typography>
                <Box p={2} bgcolor="primary.lighter" borderRadius={2} mt={1}>
                  <Typography variant="body2" fontWeight={700} gutterBottom>
                    Assigned Ambulance
                  </Typography>
                  {selectedIncident.driverInfo && (
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Driver:</strong> {selectedIncident.driverInfo.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedIncident.driverInfo.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Vehicle:</strong> {selectedIncident.driverInfo.vehicleNumber || selectedIncident.ambulanceDetails?.vehicleNumber || 'N/A'}
                      </Typography>
                    </Stack>
                  )}
                  {selectedIncident.ambulanceDetails && (
                    <Stack spacing={1} mt={1}>
                      <Typography variant="body2">
                        <strong>Ambulance ID:</strong> {selectedIncident.ambulanceDetails.ambulanceId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {selectedIncident.ambulanceDetails.type || 'N/A'}
                      </Typography>
                    </Stack>
                  )}
                  {ambulanceDetails?.currentLocation && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      <strong>Current Location:</strong> {ambulanceDetails.currentLocation.lat?.toFixed(6)}, {ambulanceDetails.currentLocation.lng?.toFixed(6)}
                    </Typography>
                  )}
                </Box>
              </div>
            )}

            <Stack direction="row" spacing={2} mt={4}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => markIncident(selectedIncident.id, 'Responding')}
              >
                Responding
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => markIncident(selectedIncident.id, 'Closed')}
              >
                Close
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Drawer>
    </Stack>
  );
};
