import MuiTimeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import Typography from '@mui/material/Typography';

export const Timeline = ({ items = [], activeIndex = 0, color = '#3B82F6' }) => (
  <MuiTimeline
    sx={{
      p: 0,
      '& .MuiTimelineItem-root:before': {
        display: 'none',
      },
    }}
  >
    {items.map((item, index) => {
      const isActive = index <= activeIndex;
      return (
        <TimelineItem key={item.id ?? index}>
          <TimelineSeparator>
            <TimelineDot
              variant={isActive ? 'filled' : 'outlined'}
              sx={{
                borderColor: color,
                backgroundColor: isActive ? color : 'background.paper',
              }}
            />
            {index < items.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="subtitle2" fontWeight={600}>
              {item.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.timestamp}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      );
    })}
  </MuiTimeline>
);

