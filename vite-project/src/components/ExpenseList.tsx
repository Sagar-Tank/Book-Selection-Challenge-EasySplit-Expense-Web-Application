import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useExpense } from '../hooks/useExpense';

const ExpenseList = () => {
  const { expenses, participants, removeExpense } = useExpense();

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || 'Unknown';
  };

  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await removeExpense(id);
      } catch {
        console.error('Failed to remove expense');
      }
    }
  };

  const getSplitTypeLabel = (type: string) => {
    switch (type) {
      case 'equal': return 'Equal';
      case 'unequal': return 'Unequal';
      case 'proportional': return 'Proportional';
      default: return type;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        📋 All Expenses
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
        {expenses.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No expenses added yet
          </Typography>
        ) : (
          <List>
            {expenses.map((expense, index) => (
              <div key={expense.id}>
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.default',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemove(expense.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {expense.description}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ₹{expense.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Chip
                      label={`Paid by: ${getParticipantName(expense.payeeId)}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={getSplitTypeLabel(expense.splitType)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Split among {expense.splits.length} participant(s):
                    </Typography>
                    {expense.splits.map((split, i) => (
                      <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                        • {getParticipantName(split.participantId)}: ₹{split.amount.toFixed(2)}
                      </Typography>
                    ))}
                  </Box>
                </ListItem>
                {index < expenses.length - 1 && <Divider sx={{ my: 1 }} />}
              </div>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default ExpenseList;

