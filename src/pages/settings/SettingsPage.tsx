import { googleAuthService } from '@/services/googleauth.service';

export default function SettingsPage() {
  return (
    <div>
      <button
        className="btn"
        onClick={async () => {
          const result = await googleAuthService.login();
          console.log(result);
        }}
      >
        Login
      </button>
    </div>
  );
}
