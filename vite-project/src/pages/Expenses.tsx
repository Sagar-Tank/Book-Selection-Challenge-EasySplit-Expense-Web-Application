import { Box, Typography, Fade } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExpenseList from '../components/ExpenseList';

const Expenses = () => {
    return (
        <Fade in={true} timeout={500}>
            <Box>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon fontSize="large" color="primary" />
                        All Expenses
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and manage all your expenses
                    </Typography>
                </Box>
                <ExpenseList />
            </Box>
        </Fade>
    );
};

export default Expenses;

