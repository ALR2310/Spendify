import { useTranslation } from 'react-i18next';

export default function ExpenseList() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold text-lg">{t('expenses.list.title')}</p>

      <div className="card shadow-sm bg-base-200 p-3 rounded-xl flex flex-row items-center gap-3">
        <div className="text-3xl">🍔</div>
        <div className="flex flex-col flex-1">
          <span className="font-semibold">Bún bò</span>
          <span className="text-sm opacity-60">
            {t('expenses.categories.food')} • 2025-11-27 • {t('expenses.filter.expense')}
          </span>
        </div>
        <div className="text-error font-semibold whitespace-nowrap">-55.000đ</div>
      </div>

      <div className="card shadow-sm bg-base-200 p-3 rounded-xl flex flex-row items-center gap-3">
        <div className="text-3xl">🚕</div>
        <div className="flex flex-col flex-1">
          <span className="font-semibold">GrabBike</span>
          <span className="text-sm opacity-60">
            {t('expenses.categories.transportation')} • 2025-11-27 • {t('expenses.filter.expense')}
          </span>
        </div>
        <div className="text-error font-semibold whitespace-nowrap">-35.000đ</div>
      </div>

      <div className="card shadow-sm bg-base-200 p-3 rounded-xl flex flex-row items-center gap-3">
        <div className="text-3xl">🏠</div>
        <div className="flex flex-col flex-1">
          <span className="font-semibold">Tiền nhà</span>
          <span className="text-sm opacity-60">
            {t('expenses.categories.housing')} • 2025-11-01 • {t('expenses.filter.expense')}
          </span>
        </div>
        <div className="text-error font-semibold whitespace-nowrap">-3.500.000đ</div>
      </div>
    </div>
  );
}
