import { Box, Typography, Card, CardContent, Avatar, Divider, Fade } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { currentUser } = useAuth();

    return (
        <Fade in={true} timeout={500}>
            <Box>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsIcon fontSize="large" color="primary" />
                        Settings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your account settings
                    </Typography>
                </Box>

                <Card elevation={3}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                                <PersonIcon sx={{ fontSize: 48 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    {currentUser?.displayName || 'User'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {currentUser?.email}
                                </Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Account Information
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        User ID
                                    </Typography>
                                    <Typography variant="body1">
                                        {currentUser?.uid}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Email Verified
                                    </Typography>
                                    <Typography variant="body1">
                                        {currentUser?.emailVerified ? 'Yes' : 'No'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Fade>
    );
};

export default Settings;

