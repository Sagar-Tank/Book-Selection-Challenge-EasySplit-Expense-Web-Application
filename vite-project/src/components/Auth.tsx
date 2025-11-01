import { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, loginWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await loginWithGoogle();
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.1
                }
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    p: 4,
                    maxWidth: 450,
                    width: '100%',
                    mx: 2,
                    borderRadius: 4,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        EasySplit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
                    </Typography>
                </Box>

                <Tabs
                    value={isLogin ? 0 : 1}
                    onChange={(_, newValue) => {
                        setIsLogin(newValue === 0);
                        setError('');
                    }}
                    sx={{ mb: 3 }}
                >
                    <Tab label="Login" />
                    <Tab label="Sign Up" />
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        sx={{ mb: 3 }}
                        disabled={loading}
                        inputProps={{ minLength: 6 }}
                        helperText={!isLogin ? 'Password must be at least 6 characters' : ''}
                    />
                    <Button
                        onClick={handleSubmit}
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            isLogin ? 'Login' : 'Sign Up'
                        )}
                    </Button>
                </Box>

                <Box sx={{ my: 2 }}>
                    <Divider>
                        <Typography variant="body2" color="text.secondary">
                            OR
                        </Typography>
                    </Divider>
                </Box>

                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                </Button>
            </Paper>
        </Box>
    );
};

export default Auth;

