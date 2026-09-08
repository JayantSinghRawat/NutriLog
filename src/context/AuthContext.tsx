import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, DailyGoals } from '../types/nutrition.js';
import { loginUser, updateUserGoals, saveUserGeminiKey } from '../services/api.js';

interface AuthContextType {
  user: UserSession | null;
  login: (email?: string, name?: string) => Promise<void>;
  logout: () => void;
  updateGoals: (goals: DailyGoals) => Promise<void>;
  updateGeminiKey: (key: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (open: boolean) => void;
}

const AUTH_KEY = 'dailylog_user_session';
const GEMINI_KEY = 'dailylog_gemini_key';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    // Default initial session so user is immediately ready to log
    return {
      id: 'user_default',
      email: 'jayant@example.com',
      name: 'Jayant',
      dailyGoals: {
        kcal: 2200,
        protein: 150,
        carbs: 220,
        fat: 65,
        fibre: 32,
      },
      hasGeminiKey: Boolean(localStorage.getItem(GEMINI_KEY)),
      geminiApiKey: localStorage.getItem(GEMINI_KEY) || '',
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Sync session with localStorage permanently
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = async (email?: string, name?: string) => {
    const session = await loginUser(email, name);
    const savedGeminiKey = localStorage.getItem(GEMINI_KEY) || '';
    setUser({
      ...session,
      geminiApiKey: savedGeminiKey,
      hasGeminiKey: Boolean(savedGeminiKey),
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
