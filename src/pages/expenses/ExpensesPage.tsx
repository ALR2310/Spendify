import { Plus } from 'lucide-react';

import ExpenseFilter from './components/ExpenseFilter';
import ExpenseList from './components/ExpenseList';
import ExpenseOverview from './components/ExpenseOverview';

export default function ExpensesPage() {
  return (
    <div className="p-4 space-y-4">
      <ExpenseOverview />
      <ExpenseFilter />
      <ExpenseList />

      <div className="fab bottom-[calc(env(safe-area-inset-bottom)+60px)]!">
        <button className="btn btn-lg btn-circle btn-success btn-soft">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
