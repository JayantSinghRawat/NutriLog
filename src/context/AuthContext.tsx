import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, DailyGoals } from '../types/nutrition.js';
import { loginUser, registerUser, updateUserGoals, saveUserGeminiKey } from '../services/api.js';

interface AuthContextType {
  user: UserSession | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, name: string, password?: string) => Promise<void>;
  logout: () => void;
  updateGoals: (goals: DailyGoals) => Promise<void>;
  updateGeminiKey: (key: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (open: boolean) => void;
}

const AUTH_KEY = 'nutrilog_user_session';
const GEMINI_KEY = 'nutrilog_gemini_key';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    // No hardcoded default user: returns null so unauthenticated visitors see the Login page
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Sync session with localStorage permanently - stays logged in until explicit logout
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    const session = await loginUser(email, password);
    const savedGeminiKey = localStorage.getItem(GEMINI_KEY) || '';
    setUser({
      ...session,
      geminiApiKey: savedGeminiKey,
      hasGeminiKey: Boolean(savedGeminiKey || session.hasGeminiKey),
    });
    setIsAuthModalOpen(false);
  };

  const register = async (email: string, name: string, password?: string) => {
    const session = await registerUser(email, name, password);
    const savedGeminiKey = localStorage.getItem(GEMINI_KEY) || '';
    setUser({
      ...session,
      geminiApiKey: savedGeminiKey,
      hasGeminiKey: Boolean(savedGeminiKey || session.hasGeminiKey),
    });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const updateGoals = async (newGoals: DailyGoals) => {
    if (!user) return;
    const updated = {
      ...user,
      dailyGoals: newGoals,
    };
    setUser(updated);
    await updateUserGoals(user.id, newGoals);
  };

  const updateGeminiKey = async (key: string) => {
    const cleanKey = key.trim();
    if (cleanKey) {
      localStorage.setItem(GEMINI_KEY, cleanKey);
    } else {
      localStorage.removeItem(GEMINI_KEY);
    }

    if (user) {
      setUser({
        ...user,
        geminiApiKey: cleanKey,
        hasGeminiKey: Boolean(cleanKey),
      });
      await saveUserGeminiKey(user.id, cleanKey);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateGoals,
        updateGeminiKey,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
