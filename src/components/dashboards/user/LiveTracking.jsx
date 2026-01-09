import React, { useMemo, useEffect, useState, useCallback , useRef} from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import { useBookingStore } from '../../../stores/bookingStore'
import { useAuthStore } from '../../../stores/authStore'
import { 
  subscribeToUserActiveEmergency, 
  subscribeToAmbulanceLocation 
} from '../../../services/emergencyService'
import { calculateDistance, calculateETA } from '../../../utils/locationUtils'
import { StatusChip } from '../../common/StatusChip'
import { Timeline } from '../../common/Timeline'
import { MapPanel } from '../../common/MapPanel'

const LiveTracking = () => {
    const user = useAuthStore((state) => state.user)
    const activeBooking = useBookingStore((state) => state.activeBooking)
    const steps = useBookingStore((state) => state.steps)
    const currentStep = useBookingStore((state) => state.currentStep)
    const etaCountdown = useBookingStore((state) => state.etaCountdown)

    const [activeEmergency, setActiveEmergency] = useState(null)
    const [ambulanceLocation, setAmbulanceLocation] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [calculatedETA, setCalculatedETA] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // ✅ Fixed: Memoize unsubscribe functions to prevent infinite re-renders
    const unsubscribeEmergencyRef = useRef(null)
    const unsubscribeAmbulanceRef = useRef(null)

    // ✅ Safe subscription to user's active emergency
    useEffect(() => {
        // Clear previous subscriptions
        if (unsubscribeEmergencyRef.current) {
            unsubscribeEmergencyRef.current()
            unsubscribeEmergencyRef.current = null
        }
        if (unsubscribeAmbulanceRef.current) {
            unsubscribeAmbulanceRef.current()
            unsubscribeAmbulanceRef.current = null
        }

        // Only proceed if user is authenticated
        if (!user?.id) {
            setActiveEmergency(null)
            setAmbulanceLocation(null)
            setCalculatedETA(null)
            return
        }

        setIsLoading(true)

        try {
            // ✅ Pass user.id explicitly as string - prevents function error
            const unsubscribeEmergency = subscribeToUserActiveEmergency(
                user.id,  // ✅ String value, not function
                (emergency) => {
                    setActiveEmergency(emergency)
                    setIsLoading(false)
                    
                    // Subscribe to ambulance location only if emergency is accepted
                    if (emergency?.status === 'accepted' && 
                        emergency?.ambulanceDetails?.ambulanceId) {
                        
                        // Clear previous ambulance subscription
                        if (unsubscribeAmbulanceRef.current) {
                            unsubscribeAmbulanceRef.current()
                        }

                        unsubscribeAmbulanceRef.current = subscribeToAmbulanceLocation(
                            emergency.ambulanceDetails.ambulanceId,
                            (ambulance) => {
                                setAmbulanceLocation(ambulance?.currentLocation || null)
                                
                                // Calculate ETA safely
                                if (emergency?.geopoint && ambulance?.currentLocation) {
                                    try {
                                        const distance = calculateDistance(
                                            emergency.geopoint.lat,
                                            emergency.geopoint.lng,
                                            ambulance.currentLocation.lat,
                                            ambulance.currentLocation.lng
                                        )
                                        const eta = calculateETA(distance)
                                        setCalculatedETA(eta)
                                    } catch (error) {
                                        console.error('ETA calculation error:', error)
                                        setCalculatedETA(null)
                                    }
                                }
                            },
                            (error) => {
                                console.error('Error listening to ambulance location:', error)
                                setAmbulanceLocation(null)
                            }
                        )
                    } else {
                        setAmbulanceLocation(null)
                        setCalculatedETA(null)
                    }
                },
                (error) => {
                    console.error('Error listening to user emergency:', error)
                    setActiveEmergency(null)
                    setIsLoading(false)
                }
            )

            unsubscribeEmergencyRef.current = unsubscribeEmergency

        } catch (error) {
            console.error('Subscription setup error:', error)
            setIsLoading(false)
        }

        // Cleanup function
        return () => {
            if (unsubscribeEmergencyRef.current) {
                unsubscribeEmergencyRef.current()
                unsubscribeEmergencyRef.current = null
            }
            if (unsubscribeAmbulanceRef.current) {
                unsubscribeAmbulanceRef.current()
                unsubscribeAmbulanceRef.current = null
            }
        }
    }, [user?.id]) // ✅ Depend only on user.id

    // Get user's current location
    useEffect(() => {
        if (!navigator.geolocation) return

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            },
            (error) => console.error('Error getting user location:', error),
            { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 60000 
            }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    const timelineItems = useMemo(
        () =>
            steps.map((step, index) => ({
                id: step,
                label: step,
                timestamp: index <= currentStep ? 'Now' : '--',
            })),
        [steps, currentStep]
    )

    // ✅ Safe map markers calculation
    const mapMarkers = useMemo(() => {
        const markers = []
        
        // Emergency location (user)
        if (activeEmergency?.geopoint?.lat && activeEmergency.geopoint.lng) {
            markers.push({
                id: 'emergency',
                x: ((activeEmergency.geopoint.lat - 28.4) * 100),
                y: ((activeEmergency.geopoint.lng - 77.0) * 100),
                label: 'YOU',
                color: '#DC2626'
            })
        }
        
        // Ambulance location
        if (ambulanceLocation?.lat && ambulanceLocation.lng) {
            markers.push({
                id: 'ambulance',
                x: ((ambulanceLocation.lat - 28.4) * 100),
                y: ((ambulanceLocation.lng - 77.0) * 100),
                label: 'AMB',
                color: '#10B981'
            })
        }
        
        return markers
    }, [activeEmergency?.geopoint, ambulanceLocation])

    const displayEmergency = activeEmergency || activeBooking
    const displayDriver = activeEmergency?.ambulanceDetails?.driver || 
                         activeEmergency?.driverInfo || 
                         activeBooking?.driver

    if (isLoading) {
        return (
            <Grid container spacing={3} id="tracking">
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                            <Stack spacing={2} alignItems="center">
                                <Typography>Loading live tracking...</Typography>
                                <LinearProgress sx={{ width: 200 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid container spacing={3} id="tracking">
            <Grid size={{ xs: 12, lg: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <div>
                                <Typography variant="h5" fontWeight={700}>
                                    Live Tracking
                                </Typography>
                                <Typography color="text.secondary">
                                    Ambulance status updates in real time
                                </Typography>
                            </div>
                            {displayEmergency ? (
                                <StatusChip label={displayEmergency.status || activeBooking?.status} />
                            ) : null}
                        </Stack>
                        
                        {displayEmergency ? (
                            <Stack spacing={3}>
                                {displayDriver && (
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: 3, 
                                            border: '1px solid', 
                                            borderColor: 'divider' 
                                        }}
                                    >
                                        <Avatar 
                                            src={displayDriver.photo} 
                                            alt={displayDriver.name} 
                                            sx={{ width: 56, height: 56 }} 
                                        />
                                        <div>
                                            <Typography fontWeight={700}>
                                                {displayDriver.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {displayDriver.vehicle || displayDriver.vehicleNumber}
                                            </Typography>
                                            <Typography variant="body2">
                                                {displayDriver.contact || displayDriver.phone}
                                            </Typography>
                                        </div>
                                        <Stack spacing={0.5} alignItems="flex-end" ml="auto">
                                            <Chip 
                                                icon={<AccessTimeRoundedIcon />} 
                                                label={`ETA ${calculatedETA || etaCountdown || 'Calculating...'}`} 
                                                color="primary" 
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {ambulanceLocation 
                                                    ? 'Live tracking active' 
                                                    : 'Waiting for ambulance...'}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                )}
                                <Timeline items={timelineItems} activeIndex={currentStep} />
                                <LinearProgress 
                                    variant="determinate" 
                                    value={((currentStep + 1) / steps.length) * 100} 
                                    sx={{ borderRadius: 999 }} 
                                />
                            </Stack>
                        ) : (
                            <Typography color="text.secondary">
                                No active emergency or booking
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            
            <Grid size={{ xs: 12, lg: 6 }}>
                <MapPanel
                    title="Live Location Tracking"
                    height={400}
                    markers={mapMarkers}
                >
                    {displayEmergency && (
                        <Stack direction="row" spacing={2} mt={2}>
                            <Chip label="Your Location (Red)" color="error" size="small" />
                            {ambulanceLocation && (
                                <Chip label="Ambulance (Green)" color="success" size="small" />
                            )}
                        </Stack>
                    )}
                </MapPanel>
            </Grid>
        </Grid>
    )
}

export default LiveTracking
