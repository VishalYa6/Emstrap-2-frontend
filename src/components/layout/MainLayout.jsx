import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { motion } from 'framer-motion';

export const MainLayout = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
    <CssBaseline />
    <Sidebar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: { md: `${Sidebar.drawerWidth}px` },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Topbar />
      <Container
        component={motion.div}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        maxWidth="xl"
        sx={{ py: 4, flexGrow: 1 }}
      >
        <Outlet />
      </Container>
    </Box>
  </Box>
);

