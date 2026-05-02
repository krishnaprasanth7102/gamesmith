'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth, useFirestore } from '../provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { setSessionCookie, clearSessionCookie } from '@/lib/auth-actions';

export interface ExtendedUser extends User {
  role?: 'user' | 'admin';
}

export function useUser() {
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Cleanup previous doc listener if it exists
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        // If we have a user, start listening to their Firestore doc for the role
        if (firestore) {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          unsubscribeDoc = onSnapshot(userDocRef, 
            (docSnap) => {
              const userData = docSnap.data();
              const extendedUser = {
                ...firebaseUser,
                role: userData?.role || 'user'
              } as ExtendedUser;
              
              setUser(extendedUser);
              setLoading(false);
            },
            (error) => {
              // Handle permission-denied gracefully (e.g., if user doc doesn't exist yet)
              if (error.code === 'permission-denied') {
                console.warn("USER_DOC_ACCESS_RESTRICTED: Basic profile active.");
              } else {
                console.error("Firestore User Doc Error:", error);
              }
              // Fallback to auth user without extra Firestore data
              setUser(firebaseUser as ExtendedUser);
              setLoading(false);
            }
          );

          await setSessionCookie(firebaseUser);
        } else {
          setUser(firebaseUser as ExtendedUser);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        await clearSessionCookie();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [auth, firestore]);

  // Check for special Master Session in localStorage
  const [isMaster, setIsMaster] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMaster(localStorage.getItem("OVERWATCH_MASTER_SESSION") === "true");
    }
  }, []);

  return { 
    user: isMaster ? { 
      uid: 'OVERWATCH_MASTER', 
      email: 'admin@overwatch.com', 
      displayName: 'OWNER', 
      photoURL: 'https://avatar.vercel.sh/owner',
      metadata: { creationTime: new Date().toISOString() }
    } as any : user, 
    loading, 
    isAdmin: (user?.role === 'admin') || isMaster 
  };
}
