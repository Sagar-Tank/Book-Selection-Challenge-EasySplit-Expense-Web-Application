import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useExpense } from '../hooks/useExpense';

const ParticipantManager: React.FC = () => {
  const { participants, addParticipant, removeParticipant } = useExpense();
  const [name, setName] = useState('');

  const handleAdd = async () => {
    if (name.trim()) {
      try {
        await addParticipant(name.trim());
        setName('');
      } catch {
        console.error('Failed to add participant');
      }
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeParticipant(id);
    } catch {
      console.error('Failed to remove participant');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon color="primary" />
        Participants
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Participant Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          fullWidth
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAdd}
          disabled={!name.trim()}
        >
          Add
        </Button>
      </Box>

      <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
        <List>
          {participants.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No participants added yet
            </Typography>
          ) : (
            participants.map((participant) => (
              <ListItem
                key={participant.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemove(participant.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={participant.name}
                  slotProps={{ primary: { fontWeight: 500 } }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>

      {participants.length > 0 && (
        <Chip
          label={`Total: ${participants.length} participant(s)`}
          color="primary"
          sx={{ mt: 2 }}
        />
      )}
    </Paper>
  );
};

export default ParticipantManager;

