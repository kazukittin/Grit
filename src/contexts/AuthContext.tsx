import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Models } from 'appwrite';
import { account } from '../lib/appwrite';
import { deleteAllUserData } from '../services/api';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check current session with optimized retry logic
        const checkSession = async (retryCount = 0) => {
            try {
                const currentUser = await account.get();
                console.log('User found:', currentUser.email);
                setUser(currentUser);
                setLoading(false);
            } catch (error) {
                console.log('No session found');

                // Only retry on OAuth redirect (when URL has success/failure params)
                const isOAuthRedirect = window.location.search.includes('success') ||
                    window.location.search.includes('failure') ||
                    window.location.pathname.includes('/auth');

                if (isOAuthRedirect && retryCount < 2) {
                    // Shorter delay for OAuth redirects
                    setTimeout(() => checkSession(retryCount + 1), 300);
                } else {
                    // No active session - set immediately
                    setUser(null);
                    setLoading(false);
                }
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

    const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: 'ユーザーがログインしていません' };
        }

        try {
            // First, delete all user data from the database
            console.log('Deleting all user data...');
            const { success: dataDeleted, deletedCounts } = await deleteAllUserData(user.$id);
            console.log('Data deletion result:', dataDeleted, deletedCounts);

            if (!dataDeleted) {
                return { success: false, error: 'データの削除中にエラーが発生しました' };
            }

            // Then, update the user's identity (Appwrite client SDK doesn't support user deletion directly)
            // The user account itself needs to be deleted from the server side via Appwrite Console or Server SDK
            // For now, we'll sign out the user and clear local data
            try {
                // Try to delete all sessions
                await account.deleteSessions();
            } catch (error) {
                console.error('Error deleting sessions:', error);
            }

            setUser(null);

            return {
                success: true,
            };
        } catch (error) {
            console.error('Error during account deletion:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'アカウント削除中にエラーが発生しました'
            };
        }
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, signOut, deleteAccount }}>
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
