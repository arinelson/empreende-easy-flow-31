
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated, loadingProfile, user } = useAuth();
  
  // Adicionar logs para debug
  useEffect(() => {
    console.log("Index: Estado de autenticação:", { isAuthenticated, loadingProfile, user });
  }, [isAuthenticated, loadingProfile, user]);
  
  // Mostrar indicação de carregamento enquanto verifica a autenticação
  if (loadingProfile) {
    console.log("Index: Carregando perfil...");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirecionar para dashboard quando autenticado
  if (isAuthenticated) {
    console.log("Index: Usuário autenticado, redirecionando para /dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Redirecionar para página de autenticação quando não autenticado
  console.log("Index: Usuário não autenticado, redirecionando para /auth");
  return <Navigate to="/auth" replace />;
};

export default Index;
