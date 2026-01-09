import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,

} from 'recharts';

import { useAdminStore } from '../../../stores/adminStore';
import { 
  subscribeToAllEmergencies, 
  subscribeToAllAmbulances, 
  subscribeToEmergencyHistory 
} from '../../../services/emergencyService';
import { MetricCard } from '../../common/MetricCard';
import { MapPanel } from '../../common/MapPanel';

const colors = ['#DC2626', '#3B82F6', '#10B981', '#F59E0B'];

export const AdminDashboard = () => {
  // ✅ FIXED: Atomic selectors to prevent infinite loop/crash
  const metrics = useAdminStore((state) => state.metrics);
  const users = useAdminStore((state) => state.users);
  const analytics = useAdminStore((state) => state.analytics);
  const updateUserRole = useAdminStore((state) => state.updateUserRole);
  const toggleUserActive = useAdminStore((state) => state.toggleUserActive);
  const addUser = useAdminStore((state) => state.addUser);
  const settings = useAdminStore((state) => state.settings);
  const updateSettings = useAdminStore((state) => state.updateSettings);

  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'USER' });
  const [allEmergencies, setAllEmergencies] = useState([]);
  const [allAmbulances, setAllAmbulances] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [mapTab, setMapTab] = useState(0);

  const userColumns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          value={params.value}
          onChange={(event) => updateUserRole(params.row.id, event.target.value)}
        >
          {['USER', 'AMBULANCE', 'HOSPITAL', 'POLICE', 'ADMIN'].map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.6,
      renderCell: (params) => (
        <Switch checked={params.value} onChange={() => toggleUserActive(params.row.id)} />
      ),
    },
  ];

  // Real-time listeners for emergencies and ambulances
  useEffect(() => {
    const unsubscribeEmergencies = subscribeToAllEmergencies(
      (emergencies) => {
        setAllEmergencies(emergencies);
        // Update metrics
        useAdminStore.setState({
          metrics: {
            ...metrics,
            todaysEmergencies: emergencies.filter(e => {
              const createdAt = e.createdAt || e.timestamp?.toDate?.() || new Date();
              const today = new Date();
              return createdAt.toDateString() === today.toDateString();
            }).length
          }
        });
      },
      (error) => console.error('Error listening to emergencies:', error)
    );

    const unsubscribeAmbulances = subscribeToAllAmbulances(
      (ambulances) => {
        setAllAmbulances(ambulances);
        // Update metrics
        useAdminStore.setState({
          metrics: {
            ...metrics,
            activeAmbulances: ambulances.length
          }
        });
      },
      (error) => console.error('Error listening to ambulances:', error)
    );

    const unsubscribeHistory = subscribeToEmergencyHistory(
      (history) => {
        setEmergencyHistory(history);
      },
      (error) => console.error('Error listening to history:', error),
      100
    );

    return () => {
      unsubscribeEmergencies();
      unsubscribeAmbulances();
      unsubscribeHistory();
    };
  }, []);

  // Prepare map markers: Red for SOS, Green for active ambulances
  const mapMarkers = [
    ...allEmergencies
      .filter(e => e.status !== 'completed')
      .map(emergency => ({
        id: emergency.id,
        x: emergency.geopoint?.lat ? ((emergency.geopoint.lat - 28.4) * 100) : 50,
        y: emergency.geopoint?.lng ? ((emergency.geopoint.lng - 77.0) * 100) : 50,
        label: emergency.type === 'SOS' ? 'S' : 'A',
        color: emergency.type === 'SOS' ? '#DC2626' : '#3B82F6',
        type: 'emergency'
      })),
    ...allAmbulances.map(ambulance => ({
      id: ambulance.id,
      x: ambulance.currentLocation?.lat ? ((ambulance.currentLocation.lat - 28.4) * 100) : 50,
      y: ambulance.currentLocation?.lng ? ((ambulance.currentLocation.lng - 77.0) * 100) : 50,
      label: 'AMB',
      color: '#10B981',
      type: 'ambulance'
    }))
  ];

  // History table columns
  const historyColumns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'type', headerName: 'Type', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'completed' ? 'success' : 'default'} />
      )
    },
    { 
      field: 'timestamp', 
      headerName: 'Time', 
      width: 180,
      valueGetter: (params) => {
        const timestamp = params.row.timestamp?.toDate?.() || params.row.createdAt || new Date();
        return new Date(timestamp).toLocaleString();
      }
    },
    { 
      field: 'location', 
      headerName: 'Location', 
      flex: 1,
      valueGetter: (params) => params.row.location?.address || 'Unknown'
    },
  ];

  return (
    <Stack spacing={4}>
      {/* Global Map View */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight={700}>
              Global Map View
            </Typography>
            <Tabs value={mapTab} onChange={(_, newValue) => setMapTab(newValue)}>
              <Tab label="All" />
              <Tab label="SOS Only" />
              <Tab label="Ambulances" />
            </Tabs>
          </Stack>
          <MapPanel
            title=""
            height={400}
            markers={mapTab === 0 
              ? mapMarkers
              : mapTab === 1
              ? mapMarkers.filter(m => m.type === 'emergency' && m.color === '#DC2626')
              : mapMarkers.filter(m => m.type === 'ambulance')
            }
          >
            <Stack direction="row" spacing={2} mt={2}>
              <Chip label={`${allEmergencies.filter(e => e.type === 'SOS' && e.status !== 'completed').length} SOS (Red)`} color="error" />
              <Chip label={`${allAmbulances.length} Ambulances (Green)`} color="success" />
            </Stack>
          </MapPanel>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Emergency History
          </Typography>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={emergencyHistory}
              columns={historyColumns}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Total users" value={metrics.totalUsers} accent="#3B82F6" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Active ambulances" value={metrics.activeAmbulances} accent="#DC2626" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Hospitals" value={metrics.registeredHospitals} accent="#0EA5E9" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Today emergencies" value={metrics.todaysEmergencies} accent="#F59E0B" />
        </Grid>
      </Grid>

      <Card variant="outlined" id="users">
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2} spacing={2}>
            <div>
              <Typography variant="h5" fontWeight={700}>
                User & role management
              </Typography>
              <Typography color="text.secondary">
                Manage permissions across the emergency response network
              </Typography>
            </div>
            <Button variant="contained" onClick={() => setOpenDialog(true)}>
              Add user
            </Button>
          </Stack>
          <div style={{ height: 360, width: '100%' }}>
            <DataGrid
              rows={users}
              columns={userColumns}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Grid container spacing={3} id="analytics">
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Daily bookings (30d)
              </Typography>
              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.bookings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" hide />
                    <YAxis />
                    <RechartTooltip />
                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Emergency types
              </Typography>
              <Box height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.emergencyBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {analytics.emergencyBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Response time by region
              </Typography>
              <Box height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.responseByRegion}>
                    <XAxis dataKey="region" />
                    <YAxis />
                    <RechartTooltip />
                    <Bar dataKey="time" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" id="settings">
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Platform settings
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <TextField
              label="Emergency categories"
              value={settings.emergencyCategories.join(', ')}
              onChange={(event) =>
                updateSettings({ emergencyCategories: event.target.value.split(',').map((item) => item.trim()) })
              }
            />
            <TextField
              type="number"
              label="SLA threshold (minutes)"
              value={settings.slaThreshold}
              onChange={(event) =>
                updateSettings({ slaThreshold: Number(event.target.value) })
              }
            />
            <Stack direction="row" spacing={3}>
              {Object.entries(settings.notifications).map(([channel, value]) => (
                <FormControlLabel
                  key={channel}
                  control={
                    <Switch
                      checked={value}
                      onChange={(event) =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            [channel]: event.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label={`Notify via ${channel}`}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Full name"
              value={newUser.name}
              onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
            />
            <TextField
              select
              label="Role"
              value={newUser.role}
              onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value }))}
            >
              {['USER', 'AMBULANCE', 'HOSPITAL', 'POLICE', 'ADMIN'].map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              addUser(newUser);
              setOpenDialog(false);
              setNewUser({ name: '', role: 'USER' });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
