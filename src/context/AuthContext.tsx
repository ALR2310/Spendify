import { createContext } from 'react';
import { useQueryClient } from 'react-query';

import {
  useGoogleIsLoggedInQuery,
  useGoogleLoginMutation,
  useGoogleLogoutMutation,
} from '@/hooks/apis/googleauth.hook';

interface AuthContextType {
  isLoggedIn: boolean;
  login(): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: isLoggedIn } = useGoogleIsLoggedInQuery();

  const { mutateAsync: loginGoogle } = useGoogleLoginMutation();
  const { mutateAsync: logoutGoogle } = useGoogleLogoutMutation();

  const login = async () => {
    try {
      await loginGoogle();
      queryClient.setQueryData(['googleauth/isLoggedIn'], true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutGoogle();
      queryClient.setQueryData(['googleauth/isLoggedIn'], false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn ?? false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
export type { AuthContextType };
