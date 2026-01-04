import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Models } from 'appwrite';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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

    const signUp = useCallback(async (email: string, password: string) => {
        try {
            // Create account
            await account.create(ID.unique(), email, password);
            // Auto sign in after signup
            await account.createEmailPasswordSession(email, password);
            const currentUser = await account.get();
            setUser(currentUser);
            return { error: null };
        } catch (error) {
            console.error('Signup error:', error);
            return { error: error instanceof Error ? error : new Error('アカウント作成に失敗しました') };
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const currentUser = await account.get();
            setUser(currentUser);
            return { error: null };
        } catch (error) {
            console.error('Signin error:', error);
            return { error: error instanceof Error ? error : new Error('ログインに失敗しました') };
        }
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
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
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
