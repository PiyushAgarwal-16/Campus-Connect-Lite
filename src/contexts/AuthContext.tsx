
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type SignupData = Omit<User, 'id'> & { password: string };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupData) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          // Handle case where user exists in Auth but not Firestore
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
        console.error("Firebase logout error:", error);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: data.name });
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userData } = data; // Don't store password in Firestore
      await setDoc(userDocRef, {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        ...(userData.role === 'student' && { studentId: userData.studentId })
      });

      return true;
    } catch (error) {
      console.error("Firebase signup error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
