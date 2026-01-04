import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Models } from 'appwrite';
import { account } from '../lib/appwrite';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session
        const checkSession = async () => {
            try {
                const currentUser = await account.get();
                setUser(currentUser);
            } catch {
                // No active session
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const signOut = useCallback(async () => {
        try {
            await account.deleteSession('current');
        } catch (error) {
            console.error('Signout error:', error);
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
