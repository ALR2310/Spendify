import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ExpensesPage() {
  useEffect(() => {
    toast.info('Expenses Page Loaded');
  }, []);

  return <div className="text-success">Expenses Page</div>;
}
