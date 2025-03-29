"use client";

import config from "@/Config/ServerUrl";
import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  _id: string;
  name?: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    toast.info("Logged out successfully");
  }, []);

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${config.API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        logout();
        return null;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.statusText}`);
      }

      const data = await res.json();
      const userData = data.user || data;
      
      if (!userData) {
        throw new Error("User data not found in response");
      }
      
      return userData;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching user:", error.message);
      } else {
        console.error("Unknown error fetching user:", error);
      }
      throw error;
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
          try {
            const freshUser = await fetchCurrentUser(storedToken);
            if (freshUser) {
              setUser(freshUser);
              setToken(storedToken);
              localStorage.setItem("user", JSON.stringify(freshUser));
              setIsInitialized(true);
              return;
            }
          } catch (fetchError) {
            console.log("Fetching fresh user failed, using stored data:", fetchError);
          }

          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              setToken(storedToken);
            } catch (parseError) {
              console.error("Error parsing stored user:", parseError);
              logout();
            }
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [fetchCurrentUser, logout]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${config.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      toast.success("Logged in successfully!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${config.API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      toast.success("Registration successful!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>; // Or your preferred loading component
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;