import './configs/i18n.config';

import { App } from '@capacitor/app';
import { sql } from 'kysely';
import { createRoot } from 'react-dom/client';
import { toast } from 'react-toastify';

import AppContainer from './App';
import { appConfig } from './configs/app.config';
import { db } from './database';
import { initializeTables } from './database/tables';
import { googleAuthService } from './services/googleauth.service';

const container = document.getElementById('root');
const root = createRoot(container!);

(window as any).appConfig = appConfig;
(window as any).toast = toast;
(window as any).db = db;
(window as any).query = async (querySQL: string) => {
  return await sql.raw(querySQL).execute(db);
};

// Init Google Auth
await googleAuthService.init();

// Init Database
await initializeTables();

App.addListener('backButton', () => {
  App.minimizeApp();
});

root.render(<AppContainer />);
