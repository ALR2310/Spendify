import './common/i18n';

import { sql } from 'kysely';
import { createRoot } from 'react-dom/client';
import { toast } from 'react-toastify';

import App from './App';
import { appConfig } from './common/appConfig';
import { db } from './common/database';
import { initializeTables } from './common/database/tables';
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

root.render(<App />);
