import './common/i18n';

import { createRoot } from 'react-dom/client';

import App from './App';
import { googleAuthService } from './services/googleauth.service';

const container = document.getElementById('root');
const root = createRoot(container!);

await googleAuthService.init();

root.render(<App />);
