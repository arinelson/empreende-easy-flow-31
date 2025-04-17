
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, USER, PASSWORD } from "@/types/models";
import { getUser, setUser, isAuthenticated, setAuthenticated, logout } from "@/services/localStorage";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setCurrentUser] = useState<User | null>(null);
  const [authenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = isAuthenticated();
    setIsAuthenticated(authStatus);

    if (authStatus) {
      // Load user from localStorage
      const savedUser = getUser();
      if (savedUser) {
        setCurrentUser(savedUser);
      } else {
        // Create default user if authenticated but no user data
        const defaultUser: User = {
          username: USER,
          theme: 'light',
        };
        setCurrentUser(defaultUser);
        setUser(defaultUser);
      }
    }
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    if (username === USER && password === PASSWORD) {
      const newUser: User = {
        username: username,
        theme: 'light',
      };
      setCurrentUser(newUser);
      setUser(newUser);
      setAuthenticated(true);
      setIsAuthenticated(true);
      toast.success("Login realizado com sucesso!");
      return true;
    } else {
      toast.error("Credenciais inválidas!");
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    logout();
    toast.info("Logout realizado com sucesso.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
