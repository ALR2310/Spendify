import { ChevronRight,LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';

import { googleAuthService } from '@/services/googleauth.service';

export default function SettingAccount() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      const result = await googleAuthService.login();
      console.log(result);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await googleAuthService.logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-base text-base-content/80 px-1">Account</p>
      <div className="card shadow-sm bg-base-200 rounded-2xl overflow-hidden">
        {isLoggedIn ? (
          <>
            <div className="p-1">
              <div className="flex items-center gap-4 p-4 rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success">
                  <User size={20} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-sm">Logged in</span>
                  <span className="text-xs opacity-60">Google Account</span>
                </div>
              </div>
            </div>
            <div className="border-t border-base-300/50 p-1">
              <button
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-error/10 active:bg-error/20 transition-colors text-error"
                onClick={handleLogout}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10">
                  <LogOut size={20} />
                </div>
                <span className="flex-1 text-left font-semibold text-sm">Log out</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-1">
            <button
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 active:bg-primary/20 transition-colors"
              onClick={handleLogin}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                <LogIn size={20} />
              </div>
              <span className="flex-1 text-left font-semibold text-sm">Sign in with Google</span>
              <ChevronRight size={18} className="opacity-40" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
