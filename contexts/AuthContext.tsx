import React, { createContext, useContext, useEffect, useState } from 'react';
import { initGoogleClient, loginToGoogle, logoutFromGoogle } from '../services/googleService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoadingAuth: boolean;
    clientId: string;
    setClientId: (id: string) => void;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Specific Client ID configured for this application
const ENV_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Manage Client ID state to support manual entry
    const [clientId, setClientId] = useState<string>(() => {
        return ENV_CLIENT_ID || localStorage.getItem('lifeos_google_client_id') || '';
    });

    useEffect(() => {
        // Initialize Google Client whenever clientId changes and is valid
        const init = async () => {
            try {
                if (clientId) {
                    await initGoogleClient(clientId);
                }
            } catch (e) {
                console.error("Failed to initialize Google Client", e);
            } finally {
                setIsLoadingAuth(false);
            }
        };
        init();
    }, [clientId]);

    const login = async () => {
        if (!clientId) {
            alert("Please enter a valid Google Client ID to proceed.");
            return;
        }

        // Save to local storage for persistence if manually entered
        if (!ENV_CLIENT_ID) {
            localStorage.setItem('lifeos_google_client_id', clientId);
        }

        try {
            // Ensure init is called at least once with the current ID before login
            await initGoogleClient(clientId);
            await loginToGoogle();
            setIsAuthenticated(true);
        } catch (e: any) {
            console.error("Login failed", e);
            if (e.error === 'popup_closed_by_user') {
                return;
            }
            alert(`Login failed: ${e.error || e.message || "Unknown error"}. Check console.`);
            throw e; // Re-throw to let components know it failed if needed
        }
    };

    const loginDemo = () => {
        setIsAuthenticated(true);
    };

    const logout = () => {
        logoutFromGoogle();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoadingAuth, clientId, setClientId, login, loginDemo, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
