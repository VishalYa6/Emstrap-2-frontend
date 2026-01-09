import React, { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '../../../stores/bookingStore'
import { emergencyTypes, ambulanceTypes } from '../../../utils/mockData'
import { createAmbulanceBooking } from '../../../services/emergencyService'
import { getCurrentLocation } from '../../../utils/locationUtils'
import { StepperFlow } from '../../common/StepperFlow'
import { StatusChip } from '../../common/StatusChip'
import { Timeline } from '../../common/Timeline'
import { MapPanel } from '../../common/MapPanel'
import { MetricCard } from '../../common/MetricCard'

const motionFactory = motion.create ?? motion
const AnimatedCard = motionFactory(Card)

const BookAmbulance = () => {
  const navigate = useNavigate()
  const activeBooking = useBookingStore((state) => state.activeBooking)
  const bookingHistory = useBookingStore((state) => state.bookingHistory)
  const steps = useBookingStore((state) => state.steps)
  const currentStep = useBookingStore((state) => state.currentStep)
  const createBooking = useBookingStore((state) => state.createBooking)
  const advanceStep = useBookingStore((state) => state.advanceStep)
  const isCreating = useBookingStore((state) => state.isCreating)
  const etaCountdown = useBookingStore((state) => state.etaCountdown)
  const tickCountdown = useBookingStore((state) => state.tickCountdown)

  const [form, setForm] = useState({
    emergencyType: emergencyTypes[0].id,
    pickup: '',
    dropoff: '',
    ambulanceType: ambulanceTypes[0].id,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const timer = setInterval(() => tickCountdown(), 60000)
    return () => clearInterval(timer)
  }, [tickCountdown])

  const selectedEmergency = emergencyTypes.find((item) => item.id === form.emergencyType)
  const selectedAmbulance = ambulanceTypes.find((item) => item.id === form.ambulanceType)

  const timelineItems = useMemo(
    () =>
      steps.map((step, index) => ({
        id: step,
        label: step,
        timestamp: index <= currentStep ? 'Now' : '--',
      })),
    [steps, currentStep]
  )

  const handleBooking = async () => {
    if (!form.pickup.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a pickup location',
        severity: 'error'
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Get current location
      const location = await getCurrentLocation()
      
      // Create booking in Firebase
      const result = await createAmbulanceBooking(
        {
          emergencyType: selectedEmergency.label,
          pickup: form.pickup,
          destination: form.dropoff,
          ambulanceType: selectedAmbulance.label,
        },
        {
          ...location,
          address: form.pickup || location.address
        }
      )

      // Update local store
      await createBooking({
        type: selectedEmergency.label,
        origin: form.pickup,
        destination: form.dropoff,
        ambulanceType: selectedAmbulance.label,
      })

      setSnackbar({
        open: true,
        message: 'Ambulance booking created successfully!',
        severity: 'success'
      })

      // Navigate to tracking page after a short delay
      setTimeout(() => {
        navigate('/user/tracking')
      }, 1500)
    } catch (error) {
      console.error('Booking error:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create booking. Please try again.',
        severity: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const heroMetrics = useMemo(
    () => [
      { label: 'Total Rides', value: bookingHistory.length + (activeBooking ? 1 : 0), accent: '#DC2626' },
      { label: 'Avg response', value: '11m 20s', accent: '#3B82F6' },
      { label: 'Critical saves', value: 42, accent: '#10B981' },
    ],
    [bookingHistory.length, activeBooking]
  )

  return (
    <Stack spacing={4} id="book">

        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} mb={3}>
              <div>
                <Typography variant="h5" fontWeight={700}>
                  Emergency booking flow
                </Typography>
                <Typography color="text.secondary">
                  Guided multi-step experience with contextual suggestions
                </Typography>
              </div>
              <Button variant="text" onClick={advanceStep} startIcon={<AutorenewRoundedIcon />}>
                Simulate live update
              </Button>
            </Stack>

            <StepperFlow steps={steps} activeStep={currentStep} />

            <Grid container spacing={3} mt={1}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  1. Select emergency type
                </Typography>
                <Stack spacing={2}>
                  {emergencyTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={form.emergencyType === type.id ? 'contained' : 'outlined'}
                      onClick={() => setForm((prev) => ({ ...prev, emergencyType: type.id }))}
                      sx={{ justifyContent: 'flex-start', borderRadius: 3, py: 1.5 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <span style={{ fontSize: 28 }}>{type.icon}</span>
                        <div>
                          <Typography fontWeight={700}>{type.label}</Typography>
                          <Typography variant="caption">{type.description}</Typography>
                        </div>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  2. Location details
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Pickup location"
                    placeholder="Use GPS or enter area"
                    fullWidth
                    value={form.pickup}
                    onChange={(event) => setForm((prev) => ({ ...prev, pickup: event.target.value }))}
                  />
                  <TextField
                    label="Destination hospital"
                    placeholder="Nearest hospital or doctor"
                    fullWidth
                    value={form.dropoff}
                    onChange={(event) => setForm((prev) => ({ ...prev, dropoff: event.target.value }))}
                  />
                  <Box
                    sx={{
                      borderRadius: 3,
                      border: '1px dashed',
                      borderColor: 'divider',
                      p: 2,
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    Interactive map placeholder (integrate Google Maps API)
                  </Box>
                </Stack>
              </Grid>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  3. Choose ambulance type
                </Typography>
                <Stack spacing={2}>
                  {ambulanceTypes.map((type) => (
                    <Card
                      key={type.id}
                      variant={form.ambulanceType === type.id ? 'elevation' : 'outlined'}
                      sx={{
                        borderRadius: 3,
                        borderColor: form.ambulanceType === type.id ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                      }}
                      onClick={() => setForm((prev) => ({ ...prev, ambulanceType: type.id }))}
                    >
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between">
                          <div>
                            <Typography fontWeight={700}>{type.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ₹{type.price.toLocaleString()} | {type.features.join(', ')}
                            </Typography>
                          </div>
                          {form.ambulanceType === type.id && <CheckCircleRoundedIcon color="success" />}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={handleBooking}
                    variant="contained"
                    size="large"
                    disabled={isCreating || isSubmitting}
                    fullWidth
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
                  >
                    {(isCreating || isSubmitting) ? 'Creating booking...' : 'Confirm booking'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

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
    </Stack>
  )
}

export default BookAmbulance