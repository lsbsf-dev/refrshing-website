"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/app";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  allowedEvents: string[];
}

interface AuthContextType {
  profile: UserProfile | null;
  activeEvent: string;
  setActiveEvent: (event: string) => void;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  activeEvent: "refreshing-2026",
  setActiveEvent: () => {},
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeEvent, setActiveEventState] = useState("refreshing-2026");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const stored = localStorage.getItem("lsbsf_admin_session");
      if (!user && !stored) {
        if (!isLoginPage) router.push("/admin/login");
        setIsLoading(false);
        return;
      }

      try {
        let headers: Record<string, string> = { "Content-Type": "application/json" };
        if (user) {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } else if (stored) {
          // If Firebase client auth has not loaded user yet, wait or handle gracefully
          const sessionData = JSON.parse(stored);
          if (sessionData.uid) {
            // Note: If no token available, /api/admin/auth/me will return 401 and redirect to login
          }
        }

        const res = await fetch("/api/admin/auth/me", {
          method: "POST",
          headers,
        });

        if (!res.ok) {
          throw new Error("Failed to verify session");
        }

        const freshProfile = await res.json();
        setProfile(freshProfile);
        
        // Restore active event from localStorage or default to their first allowed event
        const savedEvent = localStorage.getItem("lsbsf_active_event");
        if (savedEvent && freshProfile.allowedEvents?.includes(savedEvent)) {
          setActiveEventState(savedEvent);
        } else if (freshProfile.allowedEvents?.length > 0) {
          setActiveEventState(freshProfile.allowedEvents[0]);
        } else {
          setActiveEventState("refreshing-2026"); // fallback
        }

      } catch (error) {
        console.error("Session load error:", error);
        localStorage.removeItem("lsbsf_admin_session");
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        if (!isLoginPage) router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, isLoginPage, router]);

  const setActiveEvent = (event: string) => {
    setActiveEventState(event);
    localStorage.setItem("lsbsf_active_event", event);
  };

  const logout = () => {
    localStorage.removeItem("lsbsf_admin_session");
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setProfile(null);
    router.push("/admin/login");
  };

  return (
    <AuthContext.Provider value={{ profile, activeEvent, setActiveEvent, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
