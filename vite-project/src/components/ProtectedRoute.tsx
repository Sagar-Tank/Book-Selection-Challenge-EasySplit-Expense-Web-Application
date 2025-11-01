import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import Auth from './Auth';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!currentUser) {
        return <Auth />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

