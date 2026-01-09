import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import { getTheme } from './theme';
import { useAuthStore } from './stores/authStore';
import { Login } from './routes/Login';
import { Register } from './routes/Register';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { UserDashboard } from './components/dashboards/user/UserDashboard';
import BookAmbulance from './components/dashboards/user/BookAmbulance';
import RideHistory from './components/dashboards/user/RideHistory';
import LiveTracking from './components/dashboards/user/LiveTracking';
import { AmbulanceDashboard } from './components/dashboards/ambulance/AmbulanceDashboard';
import { HospitalDashboard } from './components/dashboards/hospital/HospitalDashboard';
import { PoliceDashboard } from './components/dashboards/police/PoliceDashboard';
import { AdminDashboard } from './components/dashboards/admin/AdminDashboard';

function App() {
  const mode = useAuthStore((state) => state.themeMode);
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute role="USER" />}>
            <Route element={<MainLayout />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/book" element={<BookAmbulance />} />
              <Route path="/user/history" element={<RideHistory />} />
              <Route path="/user/tracking" element={<LiveTracking />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="AMBULANCE" />}>
            <Route element={<MainLayout />}>
              <Route path="/ambulance/dashboard" element={<AmbulanceDashboard />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="HOSPITAL" />}>
            <Route element={<MainLayout />}>
              <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="POLICE" />}>
            <Route element={<MainLayout />}>
              <Route path="/police/dashboard" element={<PoliceDashboard />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route element={<MainLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
