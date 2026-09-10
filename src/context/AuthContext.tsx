import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  UserProfile,
} from '../types';
import {
  getUserProfile,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  registerStudent,
  claimAdminPrivilege,
} from '../firebase/auth';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (name: string, roll: string, email: string, pass: string, phone?: string) => Promise<UserProfile>;
  loginGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  claimAdmin: (passkey: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Listen to user profile real-time
          const userDocRef = doc(db, 'users', user.uid);
          unsubscribeProfile = onSnapshot(
            userDocRef,
            async (docSnap) => {
              if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
              } else {
                const fetched = await getUserProfile(user);
                setUserProfile(fetched);
              }
              setLoading(false);
            },
            async (err) => {
              console.warn('Profile snapshot listener error, falling back:', err);
              const fetched = await getUserProfile(user);
              setUserProfile(fetched);
              setLoading(false);
            }
          );
        } catch (e) {
          console.error('Error fetching user profile:', e);
          setLoading(false);
        }
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser);
      setUserProfile(profile);
    }
  };

  const login = async (email: string, pass: string) => {
    const profile = await loginWithEmail(email, pass);
    setUserProfile(profile);
    return profile;
  };

  const register = async (name: string, roll: string, email: string, pass: string, phone?: string) => {
    const profile = await registerStudent(name, roll, email, pass, phone);
    setUserProfile(profile);
    return profile;
  };

  const loginGoogle = async () => {
    const profile = await loginWithGoogle();
    setUserProfile(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUserProfile(null);
  };

  const claimAdmin = async (passkey: string) => {
    if (!currentUser) return false;
    const ok = await claimAdminPrivilege(currentUser.uid, passkey);
    if (ok) {
      await refreshProfile();
    }
    return ok;
  };

  const isBootstrapAdmin = currentUser?.email?.toLowerCase() === '1808benny@gmail.com';
  const isAdmin = isBootstrapAdmin || userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        login,
        register,
        loginGoogle,
        logout,
        claimAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
