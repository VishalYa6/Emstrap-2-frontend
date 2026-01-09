import React, { useState } from 'react';
// 1. Missing MUI components for the dashboard structure
import {
  Stack,
  Grid,
  CardContent,
  Typography,
  Button,
  Card,
  CircularProgress,
  Snackbar,
  Alert,
  // Removed MUI Link import as we'll use React Router Link for navigation
} from '@mui/material';
// 2. Missing icon
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';
import EmergencyIcon from '@mui/icons-material/Emergency';
// 3. 🚨 NEW: Import the Link component from React Router (or equivalent library)
import { Link as RouterLink } from 'react-router-dom';
import { createSOSEmergency } from '../../../services/emergencyService';
import { capturePhoto } from '../../../utils/cameraUtils';
import { getCurrentLocation } from '../../../utils/locationUtils'; 

// Assuming these are your custom or third-party components
import BookAmbulance from './BookAmbulance';
import RideHistory from './RideHistory';
import LiveTracking from './LiveTracking';
// Assuming you have a component that wraps Card with Framer Motion logic
import { motion } from 'framer-motion';

// Use motion.create when available to avoid deprecation warning
const motionFactory = motion.create ?? motion;
const AnimatedCard = motionFactory(Card);
const MetricCard = ({ label, value, accent }) => (
  <Card variant="outlined" sx={{ p: 2, borderColor: accent }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="h5" fontWeight={700} sx={{ color: accent }}>{value}</Typography>
  </Card>
);
const heroMetrics = [
    { label: 'Avg. Response Time', value: '4:30 min', accent: '#DC2626' },
    { label: 'Ambulances Deployed', value: '1,200+', accent: '#3B82F6' },
];

export const UserDashboard = () => {
  const [isSOSLoading, setIsSOSLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSOSEmergency = async () => {
    setIsSOSLoading(true);
    try {
      // Step 1: Get current location
      const location = await getCurrentLocation();
      
      // Step 2: Capture photo
      const photoFile = await capturePhoto();
      
      // Step 3: Create SOS emergency in Firestore
      const result = await createSOSEmergency(photoFile, location);
      
      setSnackbar({
        open: true,
        message: 'SOS Emergency sent successfully! Help is on the way.',
        severity: 'success'
      });
      
      // Optionally navigate to tracking page
      // navigate('/user/tracking');
    } catch (error) {
      console.error('SOS Error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to send SOS emergency. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSOSLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Stack spacing={4} sx={{ p: 3 }}>
        <Grid container spacing={3} id="book">
          <Grid size={{ xs: 12, md: 8 }}>
            <AnimatedCard
              elevation={0}
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                backgroundImage:
                  'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(59,130,246,0.08))',
                overflow: 'hidden',
                p: 2,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              // @ts-ignore
            >
              <CardContent>
                <Typography variant="overline" color="error" fontWeight={700}>
                  Emergency Ready
                </Typography>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  Book an ambulance in <span style={{ color: '#DC2626' }}>seconds</span>
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1} mb={3}>
                  Describe the emergency, share your location, and track help in real-time. The
                  command center keeps you informed at every milestone.
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {/* SOS Emergency Button */}
                  <Button
                    size="large"
                    variant="contained"
                    color="error"
                    startIcon={isSOSLoading ? <CircularProgress size={20} color="inherit" /> : <EmergencyIcon />}
                    onClick={handleSOSEmergency}
                    disabled={isSOSLoading}
                    sx={{ 
                      borderRadius: 999, 
                      px: 4, 
                      py: 1.5, 
                      fontWeight: 700,
                      flex: 1,
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {isSOSLoading ? 'Sending SOS...' : 'SOS Emergency'}
                  </Button>

                  {/* Book Ambulance Button */}
                  <Button
                    size="large"
                    variant="contained"
                    endIcon={<PlayCircleFilledWhiteRoundedIcon />}
                    sx={{ borderRadius: 999, px: 4, py: 1.5, fontWeight: 700, flex: 1 }}
                    component={RouterLink} 
                    to="/user/book" 
                  >
                    Book Ambulance
                  </Button>
                </Stack>
              </CardContent>
            </AnimatedCard>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              {heroMetrics.map((metric) => (
                <MetricCard key={metric.label} label={metric.value} value={metric.value} accent={metric.accent} />
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* These components would typically be rendered on the *target route* ("/book-ambulance") rather than directly on the dashboard page, 
            or they represent separate sections *below* the main hero section.
            I've kept them here as per your original structure.
        */}
      
      </Stack>

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
    </>
  );
};

export default UserDashboard;