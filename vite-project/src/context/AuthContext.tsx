import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    type User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    type UserCredential
} from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
    loginWithGoogle: () => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const createParticipantForUser = async (user: User) => {
        try {
            console.log('createParticipantForUser', user);
            // Check if participant already exists
            const q = query(
                collection(db, 'participants'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            console.log('snapshot', snapshot);
            if (snapshot.empty) {
                // Create participant entry for this user
                await addDoc(collection(db, 'participants'), {
                    name: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email || '',
                    userId: user.uid,
                    createdAt: Date.now(),
                    isUser: true // Flag to identify user-based participants
                });
            }
        } catch (error) {
            console.error('Error creating participant for user:', error);
            // Don't throw - this shouldn't block auth
        }
    };

    const signup = async (email: string, password: string) => {
        console.log('signup', email, password);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('userCredential', userCredential);
        // Add user to participants collection
        await createParticipantForUser(userCredential.user);
        return userCredential;
    };

    const login = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Check and add user to participants if not exists
        await createParticipantForUser(userCredential.user);
        return userCredential;
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        // Add user to participants collection
        await createParticipantForUser(userCredential.user);
        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

