import { Globe, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageEnum, ThemeEnum } from '@/common/enums/appconfig.enum';
import { appConfig } from '@/configs/app.config';
import i18n from '@/configs/i18n.config';
import { useThemeContext } from '@/hooks/app/useTheme';

import SettingItem from '../components/SettingItem';
import SettingSection from '../components/SettingSection';

export default function SettingAppearanceSection() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeContext();
  const [language, setLanguage] = useState<LanguageEnum>(appConfig.language);
  const [showThemeOptions, setShowThemeOptions] = useState<boolean>(false);

  useEffect(() => {
    appConfig.language = language;
  }, [language]);

  const themeConfig = {
    [ThemeEnum.LIGHT]: { icon: Sun, label: t('settings.appearance.light') },
    [ThemeEnum.DARK]: { icon: Moon, label: t('settings.appearance.dark') },
    [ThemeEnum.SYSTEM]: { icon: Monitor, label: t('settings.appearance.system') },
  };

  const currentTheme = themeConfig[theme] || themeConfig[ThemeEnum.SYSTEM];
  const CurrentIcon = currentTheme.icon;
  const themeOptions = Object.values(ThemeEnum);

  return (
    <SettingSection title={t('settings.appearance.title')}>
      {/* Theme Selection */}
      <div className="p-1">
        <SettingItem
          icon={CurrentIcon}
          iconColor="accent"
          title={t('settings.appearance.theme')}
          description={currentTheme.label}
          onClick={() => setShowThemeOptions(!showThemeOptions)}
          showChevron
          hoverColor="base"
        />

        {showThemeOptions && (
          <div className="px-4 pb-4 space-y-2">
            {themeOptions.map((themeOption) => {
              const optionConfig = themeConfig[themeOption];
              const OptionIcon = optionConfig.icon;
              const isSelected = theme === themeOption;

              return (
                <button
                  key={themeOption}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isSelected ? 'bg-success/20' : 'hover:bg-base-300/50'
                  }`}
                  onClick={() => {
                    setTheme(themeOption);
                    setShowThemeOptions(false);
                  }}
                >
                  <OptionIcon size={18} className="text-accent" />
                  <span className="flex-1 text-left text-sm font-medium">{optionConfig.label}</span>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-success"></div>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Language */}
      <SettingItem icon={Globe} iconColor="secondary" title={t('settings.appearance.language')} showBorder>
        <select
          className="select select-sm select-ghost w-full max-w-xs mt-1 h-auto py-0 text-xs"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value as LanguageEnum);
            i18n.changeLanguage(e.target.value);
          }}
        >
          {Object.entries(LanguageEnum).map(([key, value]) => (
            <option key={key} value={value}>
              {t(`settings.appearance.languages.${value}`)}
            </option>
          ))}
        </select>
      </SettingItem>
    </SettingSection>
  );
}
