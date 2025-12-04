import { Plus } from 'lucide-react';

import { useExpenseContext } from '@/hooks/app/useExpense';

import ExpenseFilter from './components/ExpenseFilter';
import ExpenseList from './components/ExpenseList';
import ExpenseStat from './components/ExpenseStat';

export default function ExpensePage() {
  const { openModal } = useExpenseContext();

  return (
    <div className="p-4 pt-0 space-y-4">
      <ExpenseFilter />
      <div className="divider m-0"></div>
      <ExpenseStat />
      <ExpenseList />

      <div className="fab bottom-[calc(env(safe-area-inset-bottom)+100px)]!">
        <button className="btn btn-lg btn-circle btn-success btn-soft" onClick={() => openModal()}>
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
