import { Plus } from 'lucide-react';

import { useExpenseUpsertContext } from '@/hooks/app/useExpense';

import ExpenseFilterSection from './sections/ExpenseFilterSection';
import ExpenseListSection from './sections/ExpenseListSection';
import ExpenseStatSection from './sections/ExpenseStatSection';

export default function ExpensePage() {
  const { openModal } = useExpenseUpsertContext();

  return (
    <div className="pt-0 space-y-4">
      <ExpenseFilterSection />
      <ExpenseStatSection />
      <ExpenseListSection />

      <div className="fab bottom-[calc(env(safe-area-inset-bottom)+100px)]!">
        <button className="btn btn-lg btn-circle btn-success btn-soft" onClick={() => openModal()}>
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
