
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Extended user type that includes profile information
interface UserWithProfile {
  id: string;
  email?: string;
  username?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserWithProfile | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loadingProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUserProfile({
          id: userId,
          email: user?.email,
          username: data.username,
          avatar: data.avatar
        });
      } else {
        // If no profile exists yet, create a default one with email as username
        const newProfile = {
          id: userId,
          email: user?.email,
          username: user?.email?.split('@')[0] || 'user'
        };
        
        setUserProfile(newProfile);
        
        // Create profile in database
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId, 
            username: newProfile.username 
          }]);
          
        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao realizar logout: " + error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        logout: handleLogout,
        isAuthenticated,
        loadingProfile,
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
