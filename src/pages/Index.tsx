
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, loadingProfile } = useAuth();
  
  // Mostrar indicação de carregamento enquanto verifica a autenticação
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirecionar para dashboard quando autenticado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Redirecionar para página de autenticação quando não autenticado
  return <Navigate to="/auth" replace />;
};

export default Index;
