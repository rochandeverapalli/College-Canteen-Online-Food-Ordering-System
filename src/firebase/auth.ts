import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from './errors';

const googleProvider = new GoogleAuthProvider();

// System bootstrapped admin emails
const SYSTEM_ADMIN_EMAILS = ['1808benny@gmail.com', 'admin@canteen.college.edu'];

export async function registerStudent(
  name: string,
  rollNumber: string,
  email: string,
  pass: string,
  phone?: string
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  const role: 'student' | 'admin' = SYSTEM_ADMIN_EMAILS.includes(email.toLowerCase().trim())
    ? 'admin'
    : 'student';

  const userProfile: UserProfile = {
    uid: user.uid,
    name: name.trim(),
    rollNumber: rollNumber.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
    role,
    phone: phone ? phone.trim() : '',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', user.uid), userProfile);
    if (role === 'admin') {
      await setDoc(doc(db, 'admins', user.uid), {
        email: userProfile.email,
        addedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }

  return userProfile;
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  return await getUserProfile(user);
}

export async function loginWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return await getUserProfile(user);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    // Auto bootstrap profile if logging in via Google
    const isSystemAdmin = SYSTEM_ADMIN_EMAILS.includes((user.email || '').toLowerCase().trim());
    const newProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || 'College Student',
      rollNumber: isSystemAdmin ? 'FACULTY-ADM' : 'ROLL-' + user.uid.slice(0, 5).toUpperCase(),
      email: user.email || '',
      role: isSystemAdmin ? 'admin' : 'student',
      phone: user.phoneNumber || '',
      createdAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, newProfile);
    if (isSystemAdmin) {
      await setDoc(doc(db, 'admins', user.uid), {
        email: newProfile.email,
        addedAt: new Date().toISOString(),
      });
    }
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'name' | 'rollNumber' | 'phone'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function claimAdminPrivilege(uid: string, passkey: string): Promise<boolean> {
  // Safe administrative setup mechanism for faculty/evaluator demo
  if (passkey === 'canteen@admin2026' || passkey === 'faculty123') {
    try {
      await updateDoc(doc(db, 'users', uid), { role: 'admin' });
      await setDoc(doc(db, 'admins', uid), {
        addedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }
  return false;
}
