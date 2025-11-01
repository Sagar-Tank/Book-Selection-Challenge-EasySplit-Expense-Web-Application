import { Box, Typography, Card, CardContent, Fade } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpenseEntry from '../components/ExpenseEntry';
import { useExpense } from '../hooks/useExpense';

const Dashboard = () => {
    const { participants, expenses, getSummary } = useExpense();
    const summary = getSummary();
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);

    return (
        <Fade in={true} timeout={500}>
            <Box>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DashboardIcon fontSize="large" color="primary" />
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Overview of your expense splitting activities
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 3,
                    mb: 4
                }}>
                    <Card elevation={2} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {participants.length}
                            </Typography>
                            <Typography variant="body2">Participants</Typography>
                        </CardContent>
                    </Card>
                    <Card elevation={2} sx={{ bgcolor: 'success.main', color: 'white', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {expenses.length}
                            </Typography>
                            <Typography variant="body2">Total Expenses</Typography>
                        </CardContent>
                    </Card>
                    <Card elevation={2} sx={{ bgcolor: 'info.main', color: 'white', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                ₹{totalExpenses.toFixed(2)}
                            </Typography>
                            <Typography variant="body2">Total Amount</Typography>
                        </CardContent>
                    </Card>
                    <Card elevation={2} sx={{ bgcolor: summary.length > 0 ? 'warning.main' : 'secondary.main', color: 'white', borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {summary.length}
                            </Typography>
                            <Typography variant="body2">Settlements Due</Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Main Content */}
                <Box>
                    <ExpenseEntry />
                </Box>
            </Box>
        </Fade>
    );
};

export default Dashboard;

