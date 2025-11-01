import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box } from '@mui/material';
import { ExpenseProvider } from './context/ExpenseContext';
import ParticipantManager from './components/ParticipantManager';
import ExpenseEntry from './components/ExpenseEntry';
import ExpenseList from './components/ExpenseList';
import SummaryView from './components/SummaryView';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: 6,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ExpenseProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
          <Container maxWidth="lg">
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                EasySplit Expense
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Split expenses easily with friends and family
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
                gap: 3
              }}
            >
              <Box sx={{ gridColumn: { xs: '1', md: 'span 4' } }}>
                <ParticipantManager />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: 'span 8' } }}>
                <ExpenseEntry />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
                <ExpenseList />
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: 'span 6' } }}>
                <SummaryView />
              </Box>
            </Box>
          </Container>
        </Box>
      </ExpenseProvider>
    </ThemeProvider>
  );
}

export default App;
