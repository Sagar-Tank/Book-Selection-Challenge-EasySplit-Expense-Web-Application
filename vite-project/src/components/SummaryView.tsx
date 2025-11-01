import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Divider,
  Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useExpense } from '../hooks/useExpense';

const SummaryView = () => {
  const { getSummary, participants } = useExpense();
  const summary = getSummary();

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || 'Unknown';
  };

  if (summary.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon color="primary" />
          Settlement Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <TrendingUpIcon sx={{ fontSize: 64, color: 'success.main', mb: 2, opacity: 0.8 }} />
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
            All Settled Up! 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No outstanding balances
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceIcon color="primary" />
        Settlement Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
        <List>
          {summary.map((item, index) => (
            <div key={`${item.fromId}-${item.toId}-${index}`}>
              <ListItem
                sx={{
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {item.fromName || getParticipantName(item.fromId)}
                  </Typography>
                  <Typography variant="body2">owes</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {item.toName || getParticipantName(item.toId)}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Chip
                    label={`₹${item.amount.toFixed(2)}`}
                    color="error"
                    sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                  />
                </Box>
              </ListItem>
              {index < summary.length - 1 && <Divider sx={{ my: 1 }} />}
            </div>
          ))}
        </List>
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.contrastText">
          <strong>Tip:</strong> These are the simplified settlement amounts. Multiple expenses may be combined for easier payments.
        </Typography>
      </Box>
    </Paper>
  );
};

export default SummaryView;

