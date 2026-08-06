"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
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

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const loadSession = async () => {
      const stored = localStorage.getItem("lsbsf_admin_session");
      if (!stored) {
        router.push("/admin/login");
        return;
      }

      try {
        const sessionData = JSON.parse(stored);
        
        // Fetch the fresh profile from the server using the uid
        // This ensures permissions are always up to date even if changed by another admin
        const res = await fetch("/api/admin/auth/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: sessionData.uid }),
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
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
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
