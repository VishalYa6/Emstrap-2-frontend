import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export const LoadingSkeleton = ({ lines = 3 }) => (
  <Stack spacing={1}>
    {Array.from({ length: lines }).map((_, idx) => (
      <Skeleton
        key={idx}
        variant="rounded"
        height={idx === 0 ? 32 : 24}
        animation="wave"
      />
    ))}
  </Stack>
);

