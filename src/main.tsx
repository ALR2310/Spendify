import { createRoot } from 'react-dom/client';
import App from './App';
import { db } from './database';
import { toast } from 'react-toastify';

const container = document.getElementById('root');
const root = createRoot(container!);

(async () => {
  const selectResult = await db.selectFrom('expenses').selectAll().execute();
  console.log('Expenses:', selectResult);

  setTimeout(() => {
    toast.info(`Has db: ${!!db}`);
  }, 3000);
})();

root.render(<App />);
