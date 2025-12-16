import { useMutation, useQuery } from 'react-query';

import { googleAuthService } from '@/services/googleauth.service';

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: () => googleAuthService.login(),
  });
}

export function useGoogleLogoutMutation() {
  return useMutation({
    mutationFn: () => googleAuthService.logout(),
  });
}

export function useGoogleRefreshTokenMutation() {
  return useMutation({
    mutationFn: () => googleAuthService.refresh(),
  });
}

export function useGoogleIsLoggedInQuery() {
  return useQuery({
    queryKey: 'googleauth/isLoggedIn',
    queryFn: () => googleAuthService.isLoggedIn(),
  });
}

export function useGoogleGetAccessTokenQuery() {
  return useQuery({
    queryKey: 'googleauth/getAccessToken',
    queryFn: () => googleAuthService.getAccessToken(),
  });
}

export function useGoogleValidateAccessToken() {
  return useMutation({
    mutationFn: ({ accessToken }: { accessToken: string }) => googleAuthService.validateAccessToken(accessToken),
  });
}

export function useGoogleGetUserInfoQuery() {
  return useQuery({
    queryKey: 'googleauth/getUserInfo',
    queryFn: () => googleAuthService.getUserInfo(),
  });
}
