import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🧑‍💼 User type
export type User = {
  fname: string;
  mname?: string;
  lname: string;
  username: string;
  email: string;
  bdate: Date;
  age: number;
  gender: string;
  contactNumber: string;
  profileImage: string;
  status: string;
  type: string;
  createdOn: Date;
};

// 📍 ActiveRoute type
export type ActiveRoute = {
  userID: string;
  location: { latitude: number; longitude: number }[];
  status: string;
  createdOn: Date;
};

// 🧠 SessionData
export type SessionData = {
  user?: User;
  activeRoute?: ActiveRoute;
};

// 💡 Context shape
type SessionContextType = {
  session: SessionData | null;
  updateSession: (newData: Partial<SessionData>) => Promise<void>;
  clearSession: () => Promise<void>;
  loading: boolean;
};

// 🔗 Context init
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// 🔐 Provider
export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('session');
        if (stored) {
          const parsed = JSON.parse(stored);

          if (parsed.user) {
            parsed.user.bdate = new Date(parsed.user.bdate);
            parsed.user.createdOn = new Date(parsed.user.createdOn);
          }

          if (parsed.activeRoute) {
            parsed.activeRoute.createdOn = new Date(parsed.activeRoute.createdOn);
          }

          setSession(parsed);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateSession = async (newData: Partial<SessionData>) => {
    try {
      const updated = { ...session, ...newData };
      setSession(updated);
      await AsyncStorage.setItem('session', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update session:', err);
    }
  };

  const clearSession = async () => {
    try {
      setSession(null);
      await AsyncStorage.removeItem('session');
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  };

  return (
    <SessionContext.Provider value={{ session, updateSession, clearSession, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

// 🎯 Hook
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
