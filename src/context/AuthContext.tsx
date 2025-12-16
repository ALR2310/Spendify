import { createContext } from 'react';
import { useQueryClient } from 'react-query';

import {
  useGoogleGetUserInfoQuery,
  useGoogleIsLoggedInQuery,
  useGoogleLoginMutation,
  useGoogleLogoutMutation,
} from '@/hooks/apis/googleauth.hook';
import { GoogleUserInfo } from '@/services/googleauth.service';

interface AuthContextType {
  isLoggedIn: boolean;
  login(): Promise<void>;
  logout(): Promise<void>;
  userInfo?: GoogleUserInfo | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: isLoggedIn } = useGoogleIsLoggedInQuery();
  const { data: userInfo, refetch: refetchUserInfo } = useGoogleGetUserInfoQuery();

  const { mutateAsync: loginGoogle } = useGoogleLoginMutation();
  const { mutateAsync: logoutGoogle } = useGoogleLogoutMutation();

  const login = async () => {
    try {
      await loginGoogle();
      queryClient.setQueryData(['googleauth/isLoggedIn'], true);
      refetchUserInfo();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutGoogle();
      queryClient.setQueryData(['googleauth/isLoggedIn'], false);
      queryClient.setQueryData(['googleauth/getUserInfo'], null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isLoggedIn ?? false,
        userInfo,
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
