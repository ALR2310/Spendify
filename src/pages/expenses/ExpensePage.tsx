import ExpenseFilterSection from './sections/ExpenseFilterSection';
import ExpenseListSection from './sections/ExpenseListSection';
import ExpenseStatSection from './sections/ExpenseStatSection';

export default function ExpensePage() {
  return (
    <div className="pt-0 space-y-4">
      <ExpenseFilterSection />
      <ExpenseStatSection />
      <ExpenseListSection />
    </div>
  );
}
