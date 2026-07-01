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

// Demo account fallback — used when Firestore rules are not yet configured
const DEMO_ROLES: Record<string, { role: UserRole; name: string }> = {
  "ravidhondge352@gmail.com": { role: "owner", name: "Ravi" },
};

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  firestoreReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

function buildFallbackProfile(user: User): UserProfile {
  const email = user.email ?? "";
  const demo = DEMO_ROLES[email];
  return {
    uid: user.uid,
    email,
    name: demo?.name ?? user.displayName ?? email.split("@")[0],
    role: demo?.role ?? "waiter",
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreReady, setFirestoreReady] = useState(true);

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
            const data = userDoc.data() as UserProfile;
            
            // Force owner role and name for the user's email if it's missing or wrong
            if (user.email === "ravidhondge352@gmail.com") {
              let updated = false;
              if (data.role !== "owner") {
                data.role = "owner";
                updated = true;
              }
              if (data.name !== "Ravi") {
                data.name = "Ravi";
                updated = true;
              }
              if (updated) {
                // Try to update it in Firestore
                setDoc(doc(db, "users", user.uid), { role: "owner", name: "Ravi" }, { merge: true }).catch(() => {});
              }
            }
            
            setUserProfile(data);
            setFirestoreReady(true);
          } else {
            // Doc doesn't exist — try to create it
            const profile = buildFallbackProfile(user);
            
            // Force owner role for the user's email
            if (user.email === "ravidhondge352@gmail.com") {
              profile.role = "owner";
            }
            
            try {
              await setDoc(doc(db, "users", user.uid), profile);
              setFirestoreReady(true);
            } catch {
              // Can't write — Firestore rules not set up yet; use fallback
              setFirestoreReady(false);
            }
            setUserProfile(profile);
          }
        } catch {
          // Firestore read blocked — use email-based fallback so app still works
          setFirestoreReady(false);
          const profile = buildFallbackProfile(user);
          if (user.email === "ravidhondge352@gmail.com") profile.role = "owner";
          setUserProfile(profile);
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
      value={{ currentUser, userProfile, role, loading, firestoreReady, login, logout, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}
