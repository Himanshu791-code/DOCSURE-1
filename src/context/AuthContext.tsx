import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as fbSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole, institutionId?: string, name?: string) => void;
  setUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo persona for initial launch: Senior Officer A. Verma
const DEFAULT_DEMO_OFFICER: AppUser = {
  uid: 'demo-officer-verma',
  email: 'a.verma.swro@aicte-india.org',
  displayName: 'A. Verma (Reg. IV Gazette Officer)',
  role: 'officer',
  isDemoUser: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(DEFAULT_DEMO_OFFICER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setCurrentUser(userSnap.data() as AppUser);
          } else {
            // Determine role: if runtime email matches, grant admin, else officer
            const role: UserRole =
              fbUser.email === 'laldashimanshu@gmail.com' ? 'admin' : 'officer';
            const newUser: AppUser = {
              uid: fbUser.uid,
              email: fbUser.email || 'user@aicte.gov.in',
              displayName: fbUser.displayName || 'Authorized AICTE Official',
              role,
              isDemoUser: false,
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (e) {
          console.warn('Error reading user profile from Firestore:', e);
          setCurrentUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Authenticated User',
            role: fbUser.email === 'laldashimanshu@gmail.com' ? 'admin' : 'officer',
            isDemoUser: false,
          });
        }
      } else {
        // Fall back to default demo persona for hackathon showcase if not logged in
        setCurrentUser((prev) => (prev && prev.isDemoUser ? prev : DEFAULT_DEMO_OFFICER));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      // Switch back to demo officer persona
      setCurrentUser(DEFAULT_DEMO_OFFICER);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  const switchDemoRole = (role: UserRole, institutionId?: string, name?: string) => {
    let persona: AppUser;
    if (role === 'admin') {
      persona = {
        uid: 'demo-admin-rao',
        email: 'member-secretary@aicte-india.org',
        displayName: name || 'Dr. S. Rao (Central AICTE Admin)',
        role: 'admin',
        isDemoUser: true,
      };
    } else if (role === 'officer') {
      persona = {
        uid: 'demo-officer-verma',
        email: 'a.verma.swro@aicte-india.org',
        displayName: name || 'A. Verma (Reg. IV Gazette Officer)',
        role: 'officer',
        isDemoUser: true,
      };
    } else {
      persona = {
        uid: 'demo-applicant-vitm',
        email: 'registrar@vitm-bangalore.edu.in',
        displayName: name || 'Dean of Affairs (Vishweshwaraya Inst.)',
        role: 'applicant',
        institutionId: institutionId || 'inst-vitm',
        isDemoUser: true,
      };
    }
    setCurrentUser(persona);
  };

  const setUserRole = async (newRole: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);
    if (!currentUser.isDemoUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (e) {
        console.error('Failed to update role in DB:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signInWithGoogle,
        signOut,
        switchDemoRole,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
