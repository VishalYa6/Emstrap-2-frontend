import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartTooltip } from 'recharts';
import { useHospitalStore } from '../../../stores/hospitalStore';
import { subscribeToActiveEmergencies, getAmbulanceStatus } from '../../../services/emergencyService';
import { MetricCard } from '../../common/MetricCard';

// ❌ Removed 'shallow' import

const kanbanOrder = ['dispatched', 'enRoute', 'arrived', 'admitted', 'discharged'];

export const HospitalDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);

  // ✅ FIXED: Atomic selectors to prevent "Maximum update depth exceeded"
  const metrics = useHospitalStore((state) => state.metrics);
  const kanban = useHospitalStore((state) => state.kanban);
  const resources = useHospitalStore((state) => state.resources);
  const updateResource = useHospitalStore((state) => state.updateResource);
  const arrivalsChart = useHospitalStore((state) => state.arrivalsChart);

  // Calculate distance helper (needs to be before useEffect)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate ETA helper (needs to be before useEffect)
  const calculateETA = (emergency, ambulanceStatus) => {
    if (!emergency.geopoint || !ambulanceStatus?.currentLocation) {
      return 'Calculating...';
    }
    const distance = calculateDistance(
      emergency.geopoint.lat,
      emergency.geopoint.lng,
      ambulanceStatus.currentLocation.lat,
      ambulanceStatus.currentLocation.lng
    );
    const etaMinutes = Math.ceil((distance / 50) * 60);
    return `${etaMinutes} mins`;
  };

  // Real-time listener for active emergencies
  useEffect(() => {
    const unsubscribe = subscribeToActiveEmergencies(
      async (emergencies) => {
        setActiveEmergencies(emergencies);

        // Fetch ambulance status for each emergency with assigned ambulance
        const emergenciesWithStatus = await Promise.all(
          emergencies.map(async (emergency) => {
            if (emergency.status === 'accepted' && emergency.ambulanceDetails?.ambulanceId) {
              try {
                const ambulanceStatus = await getAmbulanceStatus(emergency.ambulanceDetails.ambulanceId);
                const eta = ambulanceStatus ? calculateETA(emergency, ambulanceStatus) : 'Calculating...';
                return { ...emergency, ambulanceStatus, eta };
              } catch (error) {
                console.error('Error fetching ambulance status:', error);
                return { ...emergency, eta: 'Unknown' };
              }
            }
            return { ...emergency, eta: 'Pending assignment' };
          })
        );

        // Update kanban board with emergencies
        const kanbanData = {
          dispatched: emergenciesWithStatus.filter(e => e.status === 'pending' || e.status === 'accepted'),
          enRoute: emergenciesWithStatus.filter(e => e.status === 'enRoute'),
          arrived: emergenciesWithStatus.filter(e => e.status === 'arrived'),
          admitted: emergenciesWithStatus.filter(e => e.status === 'admitted'),
          discharged: emergenciesWithStatus.filter(e => e.status === 'discharged')
        };
        useHospitalStore.setState({ kanban: kanbanData });
      },
      (error) => {
        console.error('Error listening to active emergencies:', error);
      }
    );

    return () => unsubscribe();
  }, []);


  return (
    <Stack spacing={4}>
      <Grid container spacing={3}>
        {/* ✅ FIXED: Grid v2 syntax (size={{ ... }}) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Available beds" value={metrics.beds} accent="#3B82F6" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="ICU beds" value={metrics.icuBeds} accent="#DC2626" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Ventilators" value={metrics.ventilators} accent="#F59E0B" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Incoming ambulances" value={metrics.incoming} accent="#10B981" />
        </Grid>
      </Grid>

      <Grid container spacing={3} id="cases">
        {kanbanOrder.map((columnKey) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={columnKey}>
            <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={700}>
                    {columnKey}
                  </Typography>
                  <Chip label={`${kanban[columnKey].length}`} size="small" />
                </Stack>
                <Stack spacing={2}>
                  {kanban[columnKey].length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      No cases
                    </Typography>
                  ) : (
                    kanban[columnKey].map((card) => (
                      <Card key={card.id} variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Typography fontWeight={700}>
                            {card.userEmail || card.patient || 'Unknown Patient'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.type || card.condition || 'Emergency'}
                          </Typography>
                          <Typography variant="caption">
                            ETA: {card.eta || 'Calculating...'}
                          </Typography>
                          {card.status && (
                            <Chip label={card.status} size="small" sx={{ mt: 1, display: 'block' }} />
                          )}
                          <Button size="small" sx={{ mt: 1, display: 'block' }}>View Details</Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} id="resources">
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Resource management
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={4}>
                {Object.entries(resources).map(([key, value]) => (
                  <div key={key}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography textTransform="capitalize">{key}</Typography>
                      <Typography fontWeight={700}>{value}</Typography>
                    </Stack>
                    <Slider
                      value={value}
                      onChange={(_, newValue) => updateResource(key, newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={150}
                    />
                  </div>
                ))}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>Enable surge mode</Typography>
                  <Switch />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Hourly ambulance arrivals
              </Typography>
              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={arrivalsChart}>
                    <defs>
                      <linearGradient id="colorArrivals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <RechartTooltip />
                    <Area
                      type="monotone"
                      dataKey="arrivals"
                      stroke="#2563EB"
                      fillOpacity={1}
                      fill="url(#colorArrivals)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
            <TextField label="Search cases" fullWidth />
            <TextField label="Filter severity" fullWidth />
            <Button variant="contained">Apply filters</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
