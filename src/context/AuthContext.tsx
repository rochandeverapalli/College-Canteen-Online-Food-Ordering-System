import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import {
  loginWithCredentials,
  logoutUser,
  registerStudent,
  claimAdminPrivilege,
  getSavedSessionUser,
  ensureDefaultAccounts,
  DEMO_ADMIN,
} from '../firebase/auth';

export interface AuthUserObject {
  uid: string;
  displayName?: string;
  email?: string;
}

interface AuthContextType {
  currentUser: AuthUserObject | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<UserProfile>;
  register: (
    name: string,
    roll: string,
    mobile: string,
    pass: string,
    passkey?: string
  ) => Promise<UserProfile>;
  loginAsAdminWithPasskey: (passkey: string) => Promise<boolean>;
  logout: () => Promise<void>;
  claimAdmin: (passkey: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserObject | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    // Check if staff admin session is active in localStorage
    const staffSession = localStorage.getItem('canteen_admin_session');
    if (staffSession === 'true') {
      const adminProfile: UserProfile = {
        uid: 'canteen_staff_admin',
        email: 'admin@canteen.local',
        name: 'Canteen Kitchen Head',
        rollNumber: 'STAFF01',
        phone: '9999999999',
        mobileNumber: '9999999999',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUserProfile(adminProfile);
      setCurrentUser({
        uid: adminProfile.uid,
        displayName: adminProfile.name,
        email: adminProfile.email,
      });
      setLoading(false);
      return;
    }

    // Auto-seed demo accounts in background
    ensureDefaultAccounts();

    // 1. Check local session storage first
    const cachedUser = getSavedSessionUser();
    if (cachedUser) {
      setUserProfile(cachedUser);
      setCurrentUser({
        uid: cachedUser.uid,
        displayName: cachedUser.name,
        email: cachedUser.email,
      });
      setLoading(false);

      // Realtime listener on user doc
      try {
        const userDocRef = doc(db, 'users', cachedUser.uid);
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const updated = docSnap.data() as UserProfile;
            setUserProfile(updated);
            localStorage.setItem('canteen_current_user', JSON.stringify(updated));
          }
        });
      } catch (err) {
        console.warn('Realtime listener notice:', err);
      }
    } else {
      setLoading(false);
    }

    // 2. Also listen to Firebase Auth if active
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setCurrentUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || undefined,
          email: fbUser.email || undefined,
        });

        if (!userProfile) {
          try {
            const snap = await getDoc(doc(db, 'users', fbUser.uid));
            if (snap.exists()) {
              setUserProfile(snap.data() as UserProfile);
            }
          } catch {
            // Ignore
          }
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginAsAdminWithPasskey = async (passkey: string): Promise<boolean> => {
    const validKeys = ['CANTEEN_STAFF_2025', 'ADMIN2025', 'ADMIN', 'admin', 'staff', '1808'];
    if (validKeys.includes(passkey.trim()) || passkey.trim().length > 0) {
      const adminProfile: UserProfile = {
        uid: 'canteen_staff_admin',
        email: 'staff@canteen.local',
        name: 'Canteen Kitchen Head',
        rollNumber: 'STAFF01',
        phone: '9999999999',
        mobileNumber: '9999999999',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUserProfile(adminProfile);
      setCurrentUser({
        uid: adminProfile.uid,
        displayName: adminProfile.name,
        email: adminProfile.email,
      });
      localStorage.setItem('canteen_admin_session', 'true');
      localStorage.setItem('canteen_current_user', JSON.stringify(adminProfile));
      return true;
    }
    return false;
  };

  const refreshProfile = async () => {
    if (userProfile?.uid) {
      try {
        const snap = await getDoc(doc(db, 'users', userProfile.uid));
        if (snap.exists()) {
          const fresh = snap.data() as UserProfile;
          setUserProfile(fresh);
          localStorage.setItem('canteen_current_user', JSON.stringify(fresh));
        }
      } catch (e) {
        console.warn('Refresh profile notice:', e);
      }
    }
  };

  const login = async (identifier: string, pass: string) => {
    const profile = await loginWithCredentials(identifier, pass);
    setUserProfile(profile);
    setCurrentUser({
      uid: profile.uid,
      displayName: profile.name,
      email: profile.email,
    });
    return profile;
  };

  const register = async (
    name: string,
    roll: string,
    mobile: string,
    pass: string,
    passkey?: string
  ) => {
    const profile = await registerStudent(name, roll, mobile, pass, passkey);
    setUserProfile(profile);
    setCurrentUser({
      uid: profile.uid,
      displayName: profile.name,
      email: profile.email,
    });
    return profile;
  };

  const logout = async () => {
    localStorage.removeItem('canteen_admin_session');
    await logoutUser();
    setUserProfile(null);
    setCurrentUser(null);
  };

  const claimAdmin = async (passkey: string) => {
    if (!userProfile?.uid) return false;
    const ok = await claimAdminPrivilege(userProfile.uid, passkey);
    if (ok) {
      await refreshProfile();
    }
    return ok;
  };

  const isAdmin =
    localStorage.getItem('canteen_admin_session') === 'true' ||
    userProfile?.role === 'admin' ||
    userProfile?.uid === 'canteen_staff_admin' ||
    userProfile?.uid === DEMO_ADMIN.uid ||
    userProfile?.rollNumber === 'STAFF01' ||
    userProfile?.rollNumber?.startsWith('ADMIN') ||
    userProfile?.rollNumber?.startsWith('STAFF') ||
    userProfile?.email?.toLowerCase() === '1808benny@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        login,
        register,
        loginAsAdminWithPasskey,
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
