import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import LocalPoliceRoundedIcon from '@mui/icons-material/LocalPoliceRounded';
import EmergencyRecordingRoundedIcon from '@mui/icons-material/EmergencyRecordingRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useAuthStore } from '../../stores/authStore';

const drawerWidth = 250;

const navConfig = {
  USER: [
    { icon: DashboardRoundedIcon, label: 'Overview', path: '/user/dashboard' },
    { icon: EmergencyRecordingRoundedIcon, label: 'Book Ambulance', path: '/user/book' },
    { icon: HistoryRoundedIcon, label: 'Ride History', path: '/user/history' },
    { icon: TimelineRoundedIcon, label: 'Live Tracking', path: '/user/tracking' },
  ],
  AMBULANCE: [
    { icon: DashboardRoundedIcon, label: 'Live Map', path: '/ambulance/dashboard' },
    { icon: DirectionsCarFilledRoundedIcon, label: 'Active Ride', path: '/ambulance/dashboard#active' },
    { icon: HistoryRoundedIcon, label: 'Completed Trips', path: '/ambulance/dashboard#history' },
  ],
  HOSPITAL: [
    { icon: DashboardRoundedIcon, label: 'Capacity', path: '/hospital/dashboard' },
    { icon: LocalHospitalRoundedIcon, label: 'Incoming Cases', path: '/hospital/dashboard#cases' },
    { icon: TimelineRoundedIcon, label: 'Resource Planner', path: '/hospital/dashboard#resources' },
  ],
  POLICE: [
    { icon: DashboardRoundedIcon, label: 'Incidents Map', path: '/police/dashboard' },
    { icon: LocalPoliceRoundedIcon, label: 'Incident Board', path: '/police/dashboard#board' },
  ],
  ADMIN: [
    { icon: DashboardRoundedIcon, label: 'Overview', path: '/admin/dashboard' },
    { icon: AdminPanelSettingsRoundedIcon, label: 'User Management', path: '/admin/dashboard#users' },
    { icon: TimelineRoundedIcon, label: 'Analytics', path: '/admin/dashboard#analytics' },
    { icon: SettingsRoundedIcon, label: 'Settings', path: '/admin/dashboard#settings' },
  ],
};

export const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useAuthStore((state) => state.role);
  const items = navConfig[role] ?? navConfig.USER;
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    // support paths with hash like '/user/dashboard#book'
    const [pathname, hash] = path.split('#');
    navigate(pathname);
    setMobileOpen(false);
    if (hash) {
      // small timeout to allow route render
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const list = (
    <Box sx={{ p: 2 }}>
      <List>
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname + location.hash === item.path;
          return (
            <ListItem disablePadding key={item.label}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                selected={active}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: '#fff',
                    '& .MuiListItemIcon-root': {
                      color: '#fff',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ my: 2 }} />
      <List dense>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNav('/settings')}>
            <ListItemIcon>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="System Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Tooltip title="Open navigation">
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{ display: { md: 'none' }, position: 'fixed', top: 16, left: 16, zIndex: 1201 }}
          aria-label="open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>
      </Tooltip>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {list}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundImage:
              'linear-gradient(180deg, rgba(15,23,42,0.92), rgba(15,23,42,0.75))',
            color: '#F8FAFC',
          },
        }}
        open
      >
        {list}
      </Drawer>
    </>
  );
};

Sidebar.drawerWidth = drawerWidth;

