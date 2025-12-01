import './common/i18n';

import { sql } from 'kysely';
import { createRoot } from 'react-dom/client';

import App from './App';
import { db, initializeTables } from './common/database';
import { googleAuthService } from './services/googleauth.service';

const container = document.getElementById('root');
const root = createRoot(container!);

(window as any).query = async (querySQL: string) => {
  return await sql.raw(querySQL).execute(db);
};

// Init Google Auth
await googleAuthService.init();

// Init Database
await initializeTables();

root.render(<App />);
