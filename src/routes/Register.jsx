import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useAuthStore } from '../stores/authStore';
// ❌ Removed unused 'shallow' import

export const Register = () => {
  const navigate = useNavigate();
  
  // ✅ FIXED: Select state pieces individually to prevent infinite loops
  const availableRoles = useAuthStore((state) => state.availableRoles);
  const login = useAuthStore((state) => state.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Mock register simply invokes login to keep flow simple.
    await login(form);
    navigate(`/${form.role.toLowerCase()}/dashboard`, { replace: true });
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
          <TextField name="name" label="Full Name" fullWidth required value={form.name} onChange={handleChange} />
          <TextField name="email" label="Email" type="email" fullWidth required value={form.email} onChange={handleChange} />
          <TextField name="password" label="Create Password" type="password" fullWidth required value={form.password} onChange={handleChange} />
          <TextField select name="role" label="Role" value={form.role} onChange={handleChange} fullWidth>
            {availableRoles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" size="large" sx={{ py: 1.4, fontWeight: 700, borderRadius: 3 }}>
            Register & Continue
          </Button>
          <Typography variant="body2" textAlign="center">
            Already part of the network? <Link to="/login">Sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};
