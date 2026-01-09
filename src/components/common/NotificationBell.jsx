import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { useAuthStore } from '../../stores/authStore';
// ❌ Removed 'shallow'

export const NotificationBell = () => {
  // ✅ FIXED: Select pieces individually to avoid infinite loops
  const notifications = useAuthStore((state) => state.notifications);
  const markNotificationsRead = useAuthStore((state) => state.markNotificationsRead);
  const addNotification = useAuthStore((state) => state.addNotification);

  return (
    <Tooltip title={`${notifications} new alerts`}>
      <IconButton
        color="inherit"
        onClick={() => {
          markNotificationsRead();
          // Demo: immediately add a new notification to simulate live updates.
          setTimeout(addNotification, 2000);
        }}
      >
        <Badge badgeContent={notifications} color="error">
          <NotificationsRoundedIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
