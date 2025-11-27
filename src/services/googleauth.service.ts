import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

interface GoogleTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}

export const googleAuthService = new (class GoogleAuthService {
  private readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private readonly GOOGLE_TOKEN_INFO_URL = 'https://www.googleapis.com/oauth2/v1/tokeninfo';
  private readonly GOOGLE_TOKEN_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

  async init() {
    await SocialLogin.initialize({
      google: {
        mode: 'offline',
        webClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      },
    });

    console.log('GoogleAuthService initialized');
  }

  async login() {
    try {
      const authCode: string = await SocialLogin.login({
        provider: 'google',
        options: {
          forceRefreshToken: true,
          scopes: ['https://www.googleapis.com/auth/drive.appfolder', 'https://www.googleapis.com/auth/drive.file'],
        },
      }).then((result: any) => result.result.serverAuthCode);

      const tokens = await this.exchangeAuthCodeForTokens(authCode);

      await this.storeTokens(tokens);

      return {
        message: 'Google login successful',
        data: tokens,
      };
    } catch (error) {
      console.error('Google login failed', error);
      throw error;
    }
  }

  async refresh() {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
      });

      const response = await CapacitorHttp.post({
        url: this.GOOGLE_TOKEN_URL,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: params.toString(),
      });

      if (response.status !== 200) {
        throw new Error(`Failed to refresh tokens: ${response.status} ${response.data?.error_description || ''}`);
      }

      const { access_token, expires_in, id_token } = response.data;

      if (!access_token || !expires_in) {
        throw new Error('Invalid response from token refresh');
      }

      const expiresAt = (Date.now() + Number(expires_in) * 1000).toString();

      const newTokens: GoogleTokens = {
        idToken: id_token || tokens.idToken,
        accessToken: access_token,
        refreshToken: tokens.refreshToken,
        expiresAt,
      };

      await this.storeTokens(newTokens);

      return {
        message: 'Token refresh successful',
        data: newTokens,
      };
    } catch (error) {
      console.error('Token refresh failed', error);
      throw error;
    }
  }

  async logout() {
    try {
      const tokens = await this.getStoredTokens();

      // Revoke token from Google if available
      if (tokens?.accessToken) {
        try {
          await CapacitorHttp.post({
            url: this.GOOGLE_TOKEN_REVOKE_URL,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: `token=${tokens.accessToken}`,
          });
        } catch (revokeError) {
          // Don't fail logout if revoke fails, just log it
          console.warn('Failed to revoke token from Google:', revokeError);
        }
      }

      // Always clear local storage regardless of revoke result
      await this.clearStoredTokens();

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed', error);
      // Still try to clear local storage even if other operations failed
      await this.clearStoredTokens().catch((clearError) => {
        console.error('Failed to clear stored tokens during logout:', clearError);
      });
      throw error;
    }
  }

  private async clearStoredTokens() {
    await Promise.all([
      SecureStoragePlugin.remove({ key: 'id_token' }),
      SecureStoragePlugin.remove({ key: 'access_token' }),
      SecureStoragePlugin.remove({ key: 'refresh_token' }),
      SecureStoragePlugin.remove({ key: 'expires_at' }),
    ]);
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens || !tokens.accessToken || !tokens.expiresAt) {
        return false;
      }

      const isNative = Capacitor.isNativePlatform();
      if (isNative && !tokens.refreshToken) {
        return false;
      }

      // Check if token is still valid
      const now = Date.now();
      const expiresAt = Number(tokens.expiresAt);

      if (now < expiresAt) {
        return true; // Token is still valid
      }

      // Token is expired, try to refresh if refresh token is available
      if (!tokens.refreshToken) {
        return false;
      }

      try {
        const refreshResult = await this.refresh();
        return !!(refreshResult && refreshResult.data);
      } catch (refreshError) {
        console.error('Failed to refresh token', refreshError);
        return false;
      }
    } catch (error) {
      console.error('Error checking login status', error);
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens?.accessToken) {
        return null;
      }

      // Check if token is still valid
      const now = Date.now();
      const expiresAt = Number(tokens.expiresAt);

      if (now < expiresAt) {
        return tokens.accessToken;
      }

      // Token expired, try to refresh
      if (tokens.refreshToken) {
        try {
          const refreshResult = await this.refresh();
          return refreshResult?.data?.accessToken || null;
        } catch (refreshError) {
          console.error('Failed to refresh token when getting access token', refreshError);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting access token', error);
      return null;
    }
  }

  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      if (!accessToken) return false;

      const response = await CapacitorHttp.get({
        url: `${this.GOOGLE_TOKEN_INFO_URL}?access_token=${accessToken}`,
      });

      if (response.status !== 200) return false;

      const tokenInfo = response.data;

      if (!tokenInfo.expires_in) return false;

      const expiresIn = Number(tokenInfo.expires_in);
      if (expiresIn <= 0) return false;

      return true;
    } catch (error) {
      console.error('Error validating access token', error);
      return false;
    }
  }

  private async exchangeAuthCodeForTokens(authCode: string): Promise<GoogleTokens> {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
      code: authCode,
    });

    const response = await CapacitorHttp.post({
      url: this.GOOGLE_TOKEN_URL,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: params.toString(),
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to exchange auth code for tokens: ${response.status} ${response.data?.error_description || ''}`,
      );
    }

    const { access_token, expires_in, refresh_token, id_token } = response.data;

    const isNative = Capacitor.isNativePlatform();
    const isMissingToken = !access_token || !expires_in || (isNative && !refresh_token);

    if (isMissingToken) {
      throw new Error('Missing required tokens in the response');
    }

    const expiresAt = (Date.now() + Number(expires_in) * 1000).toString();

    return {
      idToken: id_token || '',
      accessToken: access_token,
      refreshToken: refresh_token || undefined,
      expiresAt,
    };
  }

  private async storeTokens(tokens: GoogleTokens) {
    await Promise.all([
      SecureStoragePlugin.set({ key: 'id_token', value: tokens.idToken }),
      SecureStoragePlugin.set({ key: 'access_token', value: tokens.accessToken }),
      SecureStoragePlugin.set({ key: 'refresh_token', value: tokens.refreshToken || '' }),
      SecureStoragePlugin.set({ key: 'expires_at', value: tokens.expiresAt }),
    ]);
  }

  private async getStoredTokens(): Promise<GoogleTokens | null> {
    try {
      const [idTokenRes, accessTokenRes, refreshTokenRes, expiresAtRes] = await Promise.all([
        SecureStoragePlugin.get({ key: 'id_token' }),
        SecureStoragePlugin.get({ key: 'access_token' }),
        SecureStoragePlugin.get({ key: 'refresh_token' }),
        SecureStoragePlugin.get({ key: 'expires_at' }),
      ]);

      // Only require accessToken and expiresAt, refreshToken is optional
      if (!accessTokenRes.value || !expiresAtRes.value) {
        return null;
      }

      return {
        idToken: idTokenRes.value || '',
        accessToken: accessTokenRes.value,
        refreshToken: refreshTokenRes.value || undefined,
        expiresAt: expiresAtRes.value,
      };
    } catch (error) {
      console.error('Error retrieving stored tokens', error);
      return null;
    }
  }
})();
