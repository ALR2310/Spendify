import { useTranslation } from 'react-i18next';

export default function ExpenseFilter() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button className="btn btn-xs btn-outline whitespace-nowrap">{t('expenses.filter.all')}</button>
        <button className="btn btn-xs btn-outline whitespace-nowrap">{t('expenses.filter.today')}</button>
        <button className="btn btn-xs btn-outline whitespace-nowrap">{t('expenses.filter.sevenDays')}</button>
        <button className="btn btn-xs btn-primary whitespace-nowrap">{t('expenses.filter.thisMonth')}</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select className="select select-sm select-bordered w-full">
          <option selected>{t('expenses.filter.category')}</option>
          <option>{t('expenses.categories.food')}</option>
          <option>{t('expenses.categories.transportation')}</option>
          <option>{t('expenses.categories.housing')}</option>
        </select>

        <select className="select select-sm select-bordered w-full">
          <option selected>{t('expenses.filter.type')}</option>
          <option>{t('expenses.filter.expense')}</option>
          <option>{t('expenses.filter.income')}</option>
        </select>
      </div>

      <button className="btn btn-sm btn-soft w-full">{t('expenses.filter.advancedFilters')}</button>
    </div>
  );
}
