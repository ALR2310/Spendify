import { ChevronRight, Globe, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { appConfig } from '@/common/appConfig';
import i18n from '@/common/i18n';
import { useTheme } from '@/hooks/app/useTheme';
import { LanguageEnum, ThemeEnum } from '@/shared/enums/appconfig.enum';

export default function SettingAppearance() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<LanguageEnum>(appConfig.language);
  const [showThemeOptions, setShowThemeOptions] = useState<boolean>(false);

  useEffect(() => {
    appConfig.language = language;
  }, [language]);

  const getThemeLabel = () => {
    switch (theme) {
      case ThemeEnum.LIGHT:
        return t('settings.appearance.light');
      case ThemeEnum.DARK:
        return t('settings.appearance.dark');
      case ThemeEnum.SYSTEM:
        return t('settings.appearance.system');
      default:
        return t('settings.appearance.system');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case ThemeEnum.LIGHT:
        return <Sun size={20} />;
      case ThemeEnum.DARK:
        return <Moon size={20} />;
      case ThemeEnum.SYSTEM:
        return <Monitor size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-base text-base-content/80 px-1">{t('settings.appearance.title')}</p>
      <div className="card shadow-sm bg-base-200 rounded-2xl overflow-hidden">
        {/* Theme Selection */}
        <div className="p-1">
          <button
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-base-300/50 active:bg-base-300 transition-colors"
            onClick={() => setShowThemeOptions(!showThemeOptions)}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              {getThemeIcon()}
            </div>
            <div className="flex flex-col flex-1 text-left">
              <span className="font-semibold text-sm">{t('settings.appearance.theme')}</span>
              <span className="text-xs opacity-60">{getThemeLabel()}</span>
            </div>
            <ChevronRight size={18} className="opacity-40" />
          </button>

          {showThemeOptions && (
            <div className="px-4 pb-4 space-y-2">
              <button
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  theme === ThemeEnum.LIGHT ? 'bg-primary/20 text-primary' : 'hover:bg-base-300/50'
                }`}
                onClick={() => {
                  setTheme(ThemeEnum.LIGHT);
                  setShowThemeOptions(false);
                }}
              >
                <Sun size={18} />
                <span className="flex-1 text-left text-sm font-medium">{t('settings.appearance.light')}</span>
                {theme === ThemeEnum.LIGHT && <div className="w-2 h-2 rounded-full bg-primary"></div>}
              </button>
              <button
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  theme === ThemeEnum.DARK ? 'bg-primary/20 text-primary' : 'hover:bg-base-300/50'
                }`}
                onClick={() => {
                  setTheme(ThemeEnum.DARK);
                  setShowThemeOptions(false);
                }}
              >
                <Moon size={18} />
                <span className="flex-1 text-left text-sm font-medium">{t('settings.appearance.dark')}</span>
                {theme === ThemeEnum.DARK && <div className="w-2 h-2 rounded-full bg-primary"></div>}
              </button>
              <button
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  theme === ThemeEnum.SYSTEM ? 'bg-primary/20 text-primary' : 'hover:bg-base-300/50'
                }`}
                onClick={() => {
                  setTheme(ThemeEnum.SYSTEM);
                  setShowThemeOptions(false);
                }}
              >
                <Monitor size={18} />
                <span className="flex-1 text-left text-sm font-medium">{t('settings.appearance.system')}</span>
                {theme === ThemeEnum.SYSTEM && <div className="w-2 h-2 rounded-full bg-primary"></div>}
              </button>
            </div>
          )}
        </div>

        {/* Language */}
        <div className="border-t border-base-300/50 p-1">
          <div className="flex items-center gap-4 p-4 rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10 text-secondary">
              <Globe size={20} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm">Language</span>
              <select
                className="select select-sm select-ghost w-full max-w-xs mt-1 h-auto py-0 text-xs"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as LanguageEnum);
                  i18n.changeLanguage(e.target.value);
                }}
              >
                {Object.entries(LanguageEnum).map(([key, value]) => (
                  <option key={key} value={value} className="capitalize">
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
