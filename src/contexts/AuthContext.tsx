import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ isAdmin: false, login: () => false, logout: () => {} });

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'o2admin2024';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (user: string, pass: string) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  return <AuthContext.Provider value={{ isAdmin, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
