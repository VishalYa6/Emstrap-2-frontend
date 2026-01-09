import Chip from '@mui/material/Chip';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { statusColors } from '../../utils/mockData';

const statusIcons = {
  Completed: CheckCircleRoundedIcon,
  default: WarningAmberRoundedIcon,
  critical: WarningAmberRoundedIcon,
  high: WarningAmberRoundedIcon,
};

export const StatusChip = ({ label, size = 'medium' }) => {
  const color =
    statusColors[label] ||
    statusColors[label?.toLowerCase?.()] ||
    statusColors.medium;
  const Icon =
    statusIcons[label] || statusIcons[label?.toLowerCase?.()] || LocalHospitalRoundedIcon;

  return (
    <Chip
      icon={<Icon fontSize="small" />}
      label={label}
      size={size}
      sx={{
        backgroundColor: `${color}22`,
        color,
        fontWeight: 600,
        borderRadius: 999,
      }}
    />
  );
};

