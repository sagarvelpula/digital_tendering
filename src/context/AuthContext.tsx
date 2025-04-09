
import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "admin" | "vendor" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: Role) => void;
  logout: () => void;
  register: (name: string, email: string, password: string, role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is stored in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string, role: Role) => {
    // In a real app, you would validate credentials against a backend
    // For demo purposes, we'll simulate a successful login
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
      role,
    };
    
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = (name: string, email: string, password: string, role: Role) => {
    // In a real app, this would create a new user in the backend
    // For demo purposes, we'll simulate a successful registration
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
    };
    
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
