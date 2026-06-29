import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "owner" | "manager" | "waiter" | "cashier";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: [
    "dashboard","tables","orders","kitchen",
    "billing","customers","menu","inventory","reports","settings",
  ],
  manager: ["dashboard", "tables", "orders", "kitchen", "reports"],
  waiter: ["tables", "orders"],
  cashier: ["billing"],
};

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserProfile(null);
  }

  function hasPermission(permission: string): boolean {
    if (!userProfile?.role) return false;
    return ROLE_PERMISSIONS[userProfile.role]?.includes(permission) ?? false;
  }

  const role = userProfile?.role ?? null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            const profile: UserProfile = {
              uid: user.uid,
              email: user.email!,
              name: user.displayName || user.email!.split("@")[0],
              role: "waiter",
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, "users", user.uid), profile);
            setUserProfile(profile);
          }
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, userProfile, role, loading, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}
