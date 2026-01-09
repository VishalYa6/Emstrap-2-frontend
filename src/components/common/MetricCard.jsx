import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

export const MetricCard = ({ label, value, icon: Icon, trend = 4.2, trendLabel = 'vs last hour', accent = '#DC2626' }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      background:
        'linear-gradient(135deg, rgba(220,38,38,0.05), rgba(59,130,246,0.04))',
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '16px',
            backgroundColor: `${accent}22`,
            display: 'grid',
            placeItems: 'center',
            color: accent,
          }}
        >
          {Icon ? <Icon /> : null}
        </Box>
        <Box textAlign="right">
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
            {(trend ?? 0) >= 0 ? (
              <TrendingUpRoundedIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownRoundedIcon fontSize="small" color="error" />
            )}
            <Typography variant="caption" color="text.secondary">
              {Math.abs(trend).toFixed(1)}% {trendLabel}
            </Typography>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

