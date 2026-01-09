import { createTheme } from '@mui/material/styles';

const primary = '#DC2626';
const secondary = '#3B82F6';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: primary,
      },
      secondary: {
        main: secondary,
      },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#020617',
        paper: mode === 'light' ? '#ffffff' : '#0F172A',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
          },
        },
      },
    },
  });

