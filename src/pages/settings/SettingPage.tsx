import SettingAccountSection from './sections/SettingAccountSection';
import SettingAppearanceSection from './sections/SettingAppearanceSection';
import SettingAppSection from './sections/SettingAppSection';
import SettingDataSection from './sections/SettingDataSection';

export default function SettingPage() {
  return (
    <div className="p-4 space-y-6">
      <SettingAppearanceSection />
      <SettingDataSection />
      <SettingAccountSection />
      <SettingAppSection />
    </div>
  );
}
