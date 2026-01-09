import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { NotificationBell } from '../common/NotificationBell';
import { RoleBadge } from '../common/RoleBadge';
// ❌ Removed 'shallow'

export const Topbar = () => {
  // ✅ FIXED: Select pieces individually
  const role = useAuthStore((state) => state.role);
  const availableRoles = useAuthStore((state) => state.availableRoles);
  const switchRole = useAuthStore((state) => state.switchRole);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);
  const themeMode = useAuthStore((state) => state.themeMode);
  const user = useAuthStore((state) => state.user ?? { name: 'Demo Operator' });

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(theme) => ({
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
        backgroundColor:
          theme.palette.mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.85)',
      })}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src="/logo.png"
            alt="Logo"
            variant="rounded"
            sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
          >
            E
          </Avatar>
          <div>
            <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
              EMR Connect
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Emergency Medical Response
            </Typography>
          </div>
          <RoleBadge role={role} />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Toggle theme">
            <Switch
              checked={themeMode === 'dark'}
              onChange={toggleTheme}
              size="small"
              color="default"
            />
          </Tooltip>

          <NotificationBell />

          <Button
            onClick={openMenu}
            variant="outlined"
            color="inherit"
            aria-haspopup="menu"
            sx={{ ml: 1, borderRadius: 99, px: 2, borderColor: 'divider' }}
            endIcon={<ArrowDropDownRoundedIcon />}
          >
            <Avatar
              src={user?.avatar}
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              {user.name[0]}
            </Avatar>
            {role}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            PaperProps={{ sx: { minWidth: 180, borderRadius: 3, mt: 1 } }}
          >
            <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block' }}>
              Switch View
            </Typography>
            {availableRoles.map((item) => (
              <MenuItem
                key={item}
                selected={item === role}
                onClick={() => {
                  switchRole(item);
                  closeMenu();
                }}
              >
                {item}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
