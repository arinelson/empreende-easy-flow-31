
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";

// Pages
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Financeiro from "@/pages/Financeiro";
import Operacoes from "@/pages/Operacoes";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import Index from "@/pages/Index";

// Providers
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loadingProfile } = useAuth();

  useEffect(() => {
    console.log("ProtectedRoute: Verificando autenticação", { isAuthenticated, loadingProfile });
  }, [isAuthenticated, loadingProfile]);

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para /auth");
    return <Navigate to="/auth" />;
  }

  console.log("ProtectedRoute: Usuário autenticado, exibindo conteúdo protegido");
  return <>{children}</>;
};

function AppRoutes() {
  const { user, loadingProfile, isAuthenticated } = useAuth();
  
  // Logging para debug
  useEffect(() => {
    console.log("AppRoutes: Estado de autenticação:", { user, loadingProfile, isAuthenticated });
  }, [user, loadingProfile, isAuthenticated]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
      <Route path="/operacoes" element={<ProtectedRoute><Operacoes /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
            <Toaster position="top-right" richColors closeButton />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
