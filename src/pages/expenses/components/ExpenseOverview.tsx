import { useTranslation } from 'react-i18next';

export default function ExpenseOverview() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 p-4 bg-base-100 rounded-xl">
        <div className="flex flex-col">
          <p className="text-base-content/60">{t('expenses.overview.totalMonthlyExpenses')}</p>
          <p className="text-xl font-bold text-error">12.500.000đ</p>
        </div>

        <div className="flex flex-col">
          <p className="text-base-content/60">{t('expenses.overview.averagePerDay')}</p>
          <p className="text-lg font-semibold">416.000đ</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-semibold text-lg">{t('expenses.overview.categories')}</p>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span>{t('expenses.categories.food')}</span>
            <span>5.600.000đ (45%)</span>
          </div>
          <progress className="progress progress-primary w-full" value="45" max="100"></progress>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span>{t('expenses.categories.transportation')}</span>
            <span>2.500.000đ (20%)</span>
          </div>
          <progress className="progress progress-secondary w-full" value="20" max="100"></progress>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span>{t('expenses.categories.housing')}</span>
            <span>1.800.000đ (15%)</span>
          </div>
          <progress className="progress progress-accent w-full" value="15" max="100"></progress>
        </div>
      </div>
    </div>
  );
}
