import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export const Register = () => {
  const navigate = useNavigate();
  
  const availableRoles = useAuthStore((state) => state.availableRoles);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error) clearError();
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    clearError();

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      return;
    }

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      if (result.success) {
        setSuccessMessage(result.message);
        // Clear form
        setForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'USER',
        });
        // Optionally redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (err) {
      // Error is already handled in the store
      console.error('Registration error:', err);
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
          'radial-gradient(circle at top, rgba(59,130,246,0.25), transparent 50%), #020617',
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
          maxWidth: 480,
          p: 4,
          borderRadius: 4,
        }}
      >
        <Stack spacing={3}>
          <div>
            <Typography variant="h4" fontWeight={800}>
              Create access
            </Typography>
            <Typography color="text.secondary">
              Register for the emergency response portal
            </Typography>
          </div>
          
          {error && (
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success">
              {successMessage}
              <br />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Redirecting to login page...
              </Typography>
            </Alert>
          )}

          <TextField 
            name="name" 
            label="Full Name" 
            fullWidth 
            required 
            value={form.name} 
            onChange={handleChange}
            disabled={isLoading}
          />
          <TextField 
            name="email" 
            label="Email" 
            type="email" 
            fullWidth 
            required 
            value={form.email} 
            onChange={handleChange}
            disabled={isLoading}
          />
          <TextField 
            name="password" 
            label="Create Password" 
            type="password" 
            fullWidth 
            required 
            value={form.password} 
            onChange={handleChange}
            disabled={isLoading}
            helperText="Password must be at least 6 characters"
          />
          <TextField 
            name="confirmPassword" 
            label="Confirm Password" 
            type="password" 
            fullWidth 
            required 
            value={form.confirmPassword} 
            onChange={handleChange}
            disabled={isLoading}
            error={form.confirmPassword !== '' && form.password !== form.confirmPassword}
            helperText={
              form.confirmPassword !== '' && form.password !== form.confirmPassword
                ? 'Passwords do not match'
                : ''
            }
          />
          <TextField 
            select 
            name="role" 
            label="Role" 
            value={form.role} 
            onChange={handleChange} 
            fullWidth
            disabled={isLoading}
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
            disabled={isLoading || form.password !== form.confirmPassword}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ py: 1.4, fontWeight: 700, borderRadius: 3 }}
          >
            {isLoading ? 'Registering...' : 'Register & Continue'}
          </Button>
          <Typography variant="body2" textAlign="center">
            Already part of the network? <Link to="/login">Sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};
