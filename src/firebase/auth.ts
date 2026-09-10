import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from './errors';

const LOCAL_STORAGE_KEY = 'canteen_current_user';

// System default seeded accounts for instant demo login
export const DEMO_ADMIN: UserProfile = {
  uid: 'admin_staff_01',
  name: 'Canteen Staff Admin',
  rollNumber: 'STAFF01',
  phone: '9876543210',
  email: 'staff01@canteen.campus.edu',
  password: 'admin12345',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export const DEMO_STUDENT: UserProfile = {
  uid: 'student_21cs042',
  name: 'Rahul Sharma',
  rollNumber: '21CS042',
  phone: '9812345678',
  email: '21cs042@canteen.campus.edu',
  password: 'password123',
  role: 'student',
  createdAt: new Date().toISOString(),
};

// Ensure default demo accounts exist in Firestore
export async function ensureDefaultAccounts(): Promise<void> {
  try {
    const adminRef = doc(db, 'users', DEMO_ADMIN.uid);
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      await setDoc(adminRef, DEMO_ADMIN);
      await setDoc(doc(db, 'admins', DEMO_ADMIN.uid), {
        email: DEMO_ADMIN.email,
        rollNumber: DEMO_ADMIN.rollNumber,
        addedAt: new Date().toISOString(),
      });
    }

    const studentRef = doc(db, 'users', DEMO_STUDENT.uid);
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      await setDoc(studentRef, DEMO_STUDENT);
    }
  } catch (err) {
    console.warn('Could not auto-seed default accounts into Firestore:', err);
  }
}

/**
 * Register a new student or canteen staff with Name, Roll Number, Mobile Number, and Password.
 */
export async function registerStudent(
  name: string,
  rollNumber: string,
  mobileNumber: string,
  pass: string,
  passkey?: string
): Promise<UserProfile> {
  const trimmedName = name.trim();
  const cleanRoll = rollNumber.trim().toUpperCase();
  const cleanMobile = mobileNumber.trim().replace(/[^0-9+]/g, '');
  const cleanPassword = pass.trim();

  if (!trimmedName) throw new Error('Full Name is required.');
  if (!cleanRoll) throw new Error('Roll Number is required.');
  if (!cleanMobile || cleanMobile.length < 7) throw new Error('Valid Mobile Number is required (at least 7 digits).');
  if (!cleanPassword || cleanPassword.length < 6) throw new Error('Password must be at least 6 characters long.');

  // Check if Roll Number already registered in Firestore
  try {
    const usersRef = collection(db, 'users');
    const rollQuery = query(usersRef, where('rollNumber', '==', cleanRoll));
    const rollSnap = await getDocs(rollQuery);
    if (!rollSnap.empty) {
      throw new Error(`A user with Roll Number "${cleanRoll}" is already registered. Please login.`);
    }

    const mobileQuery = query(usersRef, where('phone', '==', cleanMobile));
    const mobileSnap = await getDocs(mobileQuery);
    if (!mobileSnap.empty) {
      throw new Error(`Mobile number "${cleanMobile}" is already registered. Please login.`);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('already registered')) {
      throw err;
    }
    console.warn('Firestore uniqueness check notice:', err);
  }

  // Determine role based on staff passkey or admin roll prefix
  const validStaffKeys = ['CANTEEN_STAFF_2025', 'canteen@admin2026', 'faculty123', 'admin2025'];
  const isAdmin =
    (passkey && validStaffKeys.includes(passkey.trim())) ||
    cleanRoll.startsWith('STAFF') ||
    cleanRoll.startsWith('ADMIN');

  const role: 'student' | 'admin' = isAdmin ? 'admin' : 'student';
  const uid = 'user_' + cleanRoll.replace(/[^A-Z0-9]/g, '_');

  const userProfile: UserProfile = {
    uid,
    name: trimmedName,
    rollNumber: cleanRoll,
    phone: cleanMobile,
    email: `${cleanRoll.toLowerCase()}@canteen.campus.edu`,
    password: cleanPassword,
    role,
    createdAt: new Date().toISOString(),
  };

  // Attempt Firebase Auth in background if enabled, but never let it block registration
  try {
    await createUserWithEmailAndPassword(auth, userProfile.email, cleanPassword);
  } catch (authErr) {
    console.info('Firebase Auth registration note (using Firestore profile authentication):', authErr);
  }

  // Save profile to Firestore
  try {
    await setDoc(doc(db, 'users', uid), userProfile);
    if (role === 'admin') {
      await setDoc(doc(db, 'admins', uid), {
        rollNumber: cleanRoll,
        email: userProfile.email,
        phone: cleanMobile,
        addedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }

  // Save session locally
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProfile));
  return userProfile;
}

/**
 * Sign in with Roll Number or Mobile Number and Password.
 */
export async function loginWithCredentials(
  identifier: string,
  pass: string
): Promise<UserProfile> {
  const cleanId = identifier.trim();
  const cleanPassword = pass.trim();

  if (!cleanId) throw new Error('Please enter your Roll Number or Mobile Number.');
  if (!cleanPassword) throw new Error('Please enter your Password.');

  // Check demo shortcuts first for seamless evaluation
  if (
    (cleanId.toUpperCase() === DEMO_ADMIN.rollNumber || cleanId === DEMO_ADMIN.phone || cleanId.toLowerCase() === 'admin') &&
    (cleanPassword === DEMO_ADMIN.password || cleanPassword === 'admin12345' || cleanPassword === 'canteen@admin2026')
  ) {
    await ensureDefaultAccounts();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
    return DEMO_ADMIN;
  }

  if (
    (cleanId.toUpperCase() === DEMO_STUDENT.rollNumber || cleanId === DEMO_STUDENT.phone) &&
    (cleanPassword === DEMO_STUDENT.password || cleanPassword === 'password123')
  ) {
    await ensureDefaultAccounts();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_STUDENT));
    return DEMO_STUDENT;
  }

  // Query Firestore for user matching Roll Number OR Mobile Number
  try {
    const usersRef = collection(db, 'users');
    
    // 1. Check by Roll Number
    let q = query(usersRef, where('rollNumber', '==', cleanId.toUpperCase()));
    let querySnap = await getDocs(q);

    // 2. If not found, check by Mobile Number
    if (querySnap.empty) {
      q = query(usersRef, where('phone', '==', cleanId.replace(/[^0-9+]/g, '')));
      querySnap = await getDocs(q);
    }

    // 3. If not found, check by doc ID direct lookup
    if (querySnap.empty) {
      const directRef = doc(db, 'users', 'user_' + cleanId.toUpperCase().replace(/[^A-Z0-9]/g, '_'));
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const found = directSnap.data() as UserProfile;
        if (found.password && found.password !== cleanPassword) {
          throw new Error('Incorrect password. Please verify and try again.');
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(found));
        return found;
      }
    }

    if (querySnap.empty) {
      throw new Error(`No account found for "${cleanId}". Please check your Roll Number / Mobile Number or Register.`);
    }

    const matchedDoc = querySnap.docs[0];
    const profile = matchedDoc.data() as UserProfile;

    if (profile.password && profile.password !== cleanPassword) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    // Also attempt Firebase Auth in background if available
    try {
      if (profile.email) {
        await signInWithEmailAndPassword(auth, profile.email, cleanPassword);
      }
    } catch {
      // Ignore fallback error
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to sign in. Please check your credentials.');
  }
}

/**
 * Log out user and clear stored session.
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  try {
    await signOut(auth);
  } catch {
    // Ignore sign out error
  }
}

/**
 * Get the currently logged-in user from localStorage or Firestore.
 */
export function getSavedSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

/**
 * Update user profile details.
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'name' | 'rollNumber' | 'phone'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), data);
    const existing = getSavedSessionUser();
    if (existing && existing.uid === uid) {
      const updated = { ...existing, ...data };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

/**
 * Claim Canteen Staff / Admin privileges with secret passkey.
 */
export async function claimAdminPrivilege(uid: string, passkey: string): Promise<boolean> {
  const validKeys = ['CANTEEN_STAFF_2025', 'canteen@admin2026', 'faculty123', 'admin2025'];
  if (validKeys.includes(passkey.trim())) {
    try {
      await updateDoc(doc(db, 'users', uid), { role: 'admin' });
      await setDoc(doc(db, 'admins', uid), {
        addedAt: new Date().toISOString(),
      });
      const existing = getSavedSessionUser();
      if (existing && existing.uid === uid) {
        existing.role = 'admin';
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
      }
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }
  return false;
}
