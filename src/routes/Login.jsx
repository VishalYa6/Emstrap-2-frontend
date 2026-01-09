import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useAuthStore } from '../stores/authStore';

export const Login = () => {
  const navigate = useNavigate();
  
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const availableRoles = useAuthStore((state) => state.availableRoles);

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'USER',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearError();

    try {
      const user = await login(form);
      // Navigation will happen based on the user's actual role from Firestore
      if (user && user.role) {
        navigate(`/${user.role.toLowerCase()}/dashboard`, { replace: true });
      }
    } catch (err) {
      // Error is already handled in the store
      console.error('Login error:', err);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          'radial-gradient(circle at top, rgba(220,38,38,0.2), transparent 45%), #0F172A',
        color: '#F8FAFC',
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
          backgroundColor: 'background.paper',
        }}
      >
        <Stack spacing={3}>
          <div>
            <Typography variant="h4" fontWeight={800}>
              Welcome back
            </Typography>
            <Typography color="text.secondary">
              Access the EMR Connect control center
            </Typography>
          </div>
          
          {error && (
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          )}

          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="email"
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            required
            value={form.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <TextField
            select
            name="role"
            label="Choose Role"
            value={form.role}
            onChange={handleChange}
            fullWidth
            disabled={isLoading}
            helperText="Select the role you registered with"
          >
            {availableRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              py: 1.4,
              fontWeight: 700,
              borderRadius: 3,
            }}
          >
            {isLoading ? 'Signing in...' : 'Enter Command Center'}
          </Button>
          <Typography variant="body2" textAlign="center">
            Need an account? <Link to="/register">Register</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};
