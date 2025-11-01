import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Alert,
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import { useExpense } from '../hooks/useExpense';

const ExpenseEntry: React.FC = () => {
  const { participants, addExpense } = useExpense();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payeeId, setPayeeId] = useState<string>('');
  const [splitType, setSplitType] = useState<'equal' | 'unequal' | 'proportional'>('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [unequalSplits, setUnequalSplits] = useState<Record<string, number>>({});
  const [proportionalShares, setProportionalShares] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const handleAddExpense = async () => {
    setError('');

    // Validation
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!payeeId) {
      setError('Please select a payee');
      return;
    }
    if (selectedParticipants.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    // Get payee name
    const payee = participants.find(p => p.id === payeeId);
    if (!payee) {
      setError('Payee not found');
      return;
    }

    let splits: Array<{ participantId: string; participantName: string; amount: number }> = [];
    let shares: Record<string, number> | undefined = undefined;

    if (splitType === 'equal') {
      const perPerson = parseFloat(amount) / selectedParticipants.length;
      splits = selectedParticipants.map(id => {
        const participant = participants.find(p => p.id === id);
        return {
          participantId: id,
          participantName: participant?.name || 'Unknown',
          amount: perPerson
        };
      });
    } else if (splitType === 'unequal') {
      const totalUnequal = selectedParticipants.reduce((sum, id) =>
        sum + (unequalSplits[id] || 0), 0);

      if (Math.abs(totalUnequal - parseFloat(amount)) > 0.01) {
        setError(`Unequal splits must total to ₹${amount}`);
        return;
      }

      splits = selectedParticipants.map(id => {
        const participant = participants.find(p => p.id === id);
        return {
          participantId: id,
          participantName: participant?.name || 'Unknown',
          amount: unequalSplits[id] || 0
        };
      });
    } else if (splitType === 'proportional') {
      const totalShares = selectedParticipants.reduce((sum, id) =>
        sum + (proportionalShares[id] || 0), 0);

      if (totalShares === 0) {
        setError('Please assign at least one share');
        return;
      }

      shares = { ...proportionalShares };
      splits = selectedParticipants.map(id => {
        const participant = participants.find(p => p.id === id);
        const share = proportionalShares[id] || 0;
        return {
          participantId: id,
          participantName: participant?.name || 'Unknown',
          amount: (share / totalShares) * parseFloat(amount)
        };
      });
    }

    try {
      await addExpense({
        description,
        totalAmount: parseFloat(amount),
        payeeId,
        payeeName: payee.name,
        splitType,
        splits,
        shares,
        createdAt: Date.now()
      });

      // Reset form
      setDescription('');
      setAmount('');
      setPayeeId('');
      setSelectedParticipants([]);
      setUnequalSplits({});
      setProportionalShares({});
      setError('');
    } catch {
      setError('Failed to add expense');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaymentIcon color="primary" />
        Add Expense
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Amount"
            type="number"
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Payee</InputLabel>
            <Select
              value={payeeId}
              onChange={(e) => setPayeeId(e.target.value)}
              label="Payee"
            >
              {participants.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Split Method</InputLabel>
          <Select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value as 'equal' | 'unequal' | 'proportional')}
            label="Split Method"
          >
            <MenuItem value="equal">Equal Split</MenuItem>
            <MenuItem value="unequal">Unequal Split (Custom)</MenuItem>
            <MenuItem value="proportional">Proportional Split (Shares)</MenuItem>
          </Select>
        </FormControl>

        <Autocomplete
          multiple
          options={participants}
          getOptionLabel={(option) => `${option.name}${option.email ? ` (${option.email})` : ''}`}
          value={participants.filter(p => selectedParticipants.includes(p.id))}
          onChange={(_, newValue) => {
            setSelectedParticipants(newValue.map(p => p.id));
            // Reset custom splits when participants change
            setUnequalSplits({});
            setProportionalShares({});
          }}
          renderInput={(params) => (
            <TextField {...params} label="Select Participants (Platform Users)" placeholder="Select registered users..." />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                {...getTagProps({ index })}
                key={option.id}
              />
            ))
          }
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.name}
                </Typography>
                {option.email && (
                  <Typography variant="caption" color="text.secondary">
                    {option.email}
                  </Typography>
                )}
              </Box>
            </li>
          )}
        />

        {splitType === 'unequal' && selectedParticipants.length > 0 && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Enter Amount for Each Person
            </Typography>
            {selectedParticipants.map(id => {
              const participant = participants.find(p => p.id === id);
              return (
                <TextField
                  key={id}
                  label={participant?.name}
                  type="number"
                  variant="outlined"
                  value={unequalSplits[id] || ''}
                  onChange={(e) => setUnequalSplits(prev => ({
                    ...prev,
                    [id]: parseFloat(e.target.value) || 0
                  }))}
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                  }}
                />
              );
            })}
            {amount && (
              <Chip
                label={`Total: ₹${amount}`}
                color="primary"
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        )}

        {splitType === 'proportional' && selectedParticipants.length > 0 && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Assign Shares (e.g., 2, 1, 1)
            </Typography>
            {selectedParticipants.map(id => {
              const participant = participants.find(p => p.id === id);
              const share = proportionalShares[id] || 0;
              const totalShares = selectedParticipants.reduce((sum, pid) =>
                sum + (proportionalShares[pid] || 0), 0);
              const calculatedAmount = totalShares > 0 && amount
                ? ((share / totalShares) * parseFloat(amount)).toFixed(2)
                : null;

              return (
                <TextField
                  key={id}
                  label={participant?.name + (calculatedAmount ? ` (₹${calculatedAmount})` : '')}
                  type="number"
                  variant="outlined"
                  value={proportionalShares[id] || ''}
                  onChange={(e) => setProportionalShares(prev => ({
                    ...prev,
                    [id]: parseFloat(e.target.value) || 0
                  }))}
                  fullWidth
                  size="small"
                  sx={{ mt: 1 }}
                  helperText={calculatedAmount ? `${share} share(s) = ₹${calculatedAmount}` : undefined}
                />
              );
            })}
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleAddExpense}
          disabled={participants.length === 0}
          size="large"
        >
          Add Expense
        </Button>
      </Box>
    </Paper>
  );
};

export default ExpenseEntry;

