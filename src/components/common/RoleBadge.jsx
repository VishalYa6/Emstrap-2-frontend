import Chip from '@mui/material/Chip';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import LocalPoliceRoundedIcon from '@mui/icons-material/LocalPoliceRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import LocalTaxiRoundedIcon from '@mui/icons-material/LocalTaxiRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const roleMap = {
  USER: { color: '#0EA5E9', icon: PersonRoundedIcon },
  AMBULANCE: { color: '#F59E0B', icon: LocalTaxiRoundedIcon },
  HOSPITAL: { color: '#10B981', icon: LocalHospitalRoundedIcon },
  POLICE: { color: '#6366F1', icon: LocalPoliceRoundedIcon },
  ADMIN: { color: '#DC2626', icon: ShieldRoundedIcon },
};

export const RoleBadge = ({ role }) => {
  const config = roleMap[role] ?? roleMap.USER;
  const Icon = config.icon;
  return (
    <Chip
      icon={<Icon fontSize="small" />}
      label={role}
      sx={{
        backgroundColor: `${config.color}22`,
        color: config.color,
        fontWeight: 600,
        borderRadius: 8,
      }}
    />
  );
};

