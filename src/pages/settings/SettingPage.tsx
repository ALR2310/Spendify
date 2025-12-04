import SettingAccount from './components/SettingAccount';
import SettingApp from './components/SettingApp';
import SettingAppearance from './components/SettingAppearance';
import SettingData from './components/SettingData';

export default function SettingPage() {
  return (
    <div className="p-4 space-y-6">
      <SettingAppearance />
      <SettingData />
      <SettingAccount />
      <SettingApp />
    </div>
  );
}
