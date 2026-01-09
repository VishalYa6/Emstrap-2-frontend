import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { motion } from 'framer-motion';

const MotionMarker = motion.div;

export const MapPanel = ({
  title = 'Live Map',
  markers = [],
  activeMarker,
  height = 280,
  children,
}) => (
  <Box
    sx={{
      p: 3,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      background: 'linear-gradient(145deg, #0F172A, #1E293B)',
      color: '#F8FAFC',
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Box>
    <Box
      sx={{
        height,
        borderRadius: 2,
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {markers.map((marker) => (
        <MotionMarker
          key={marker.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            top: `${marker.y}%`,
            left: `${marker.x}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Avatar
            sx={{
              width: activeMarker === marker.id ? 48 : 36,
              height: activeMarker === marker.id ? 48 : 36,
              bgcolor: marker.color ?? '#DC2626',
              boxShadow: activeMarker === marker.id ? '0 0 12px rgba(255,255,255,0.6)' : 'none',
            }}
          >
            {marker.label}
          </Avatar>
        </MotionMarker>
      ))}
    </Box>
  </Box>
);

