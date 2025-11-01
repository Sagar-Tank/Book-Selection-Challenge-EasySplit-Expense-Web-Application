import { Box, Typography, Fade } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SummaryView from '../components/SummaryView';

const Summary = () => {
    return (
        <Fade in={true} timeout={500}>
            <Box>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceIcon fontSize="large" color="primary" />
                        Settlement Summary
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        See who owes what and simplify your settlements
                    </Typography>
                </Box>
                <SummaryView />
            </Box>
        </Fade>
    );
};

export default Summary;

