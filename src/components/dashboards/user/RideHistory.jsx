import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import { useBookingStore } from '../../../stores/bookingStore'
import { StatusChip } from '../../common/StatusChip'

const RideHistory = () => {
    const activeBooking = useBookingStore((state) => state.activeBooking)
    const bookingHistory = useBookingStore((state) => state.bookingHistory)

    return (
        <>
            <Card variant="outlined" id="history" sx={{ borderRadius: 4 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
                        <div>
                            <Typography variant="h5" fontWeight={700}>
                                Ride history
                            </Typography>
                            <Typography color="text.secondary">
                                Track past emergencies, response times, and billing
                            </Typography>
                        </div>
                        <Button variant="outlined">Download report</Button>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                        {[activeBooking, ...bookingHistory].filter(Boolean).map((ride) => (
                            <Box
                                key={ride.id}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 2,
                                    alignItems: 'center',
                                    p: 2,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <div>
                                    <Typography fontWeight={700}>{ride.type}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ride.origin} → {ride.destination}
                                    </Typography>
                                </div>
                                <StatusChip label={ride.status} />
                                <Typography fontWeight={700}>₹{ride.cost.toLocaleString()}</Typography>
                                <Typography color="text.secondary">{ride.eta} ETA</Typography>
                            </Box>
                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </>
    )
}

export default RideHistory