import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useMonthPickerContext } from '@/hooks/app/useMonthPicker';
import { getMonthLabel } from '@/utils/general.utils';

export default function ExpenseFilter() {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  const [monthValue, openPicker, _, setMonthValue] = useMonthPickerContext({
    year: currentYear,
    month: currentMonth,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="join bg-base-100 rounded-lg">
        <button
          className="btn btn-ghost join-item"
          onClick={() => {
            if (!monthValue) return;
            if (monthValue.month > 1) setMonthValue({ year: monthValue.year, month: monthValue.month - 1 });
            else setMonthValue({ year: monthValue.year - 1, month: 12 });
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <button className="btn btn-ghost join-item flex-1" onClick={openPicker}>
          {monthValue?.year === currentYear && monthValue?.month === currentMonth
            ? 'This Month'
            : getMonthLabel(monthValue!.month, locale)}
        </button>

        <button
          className="btn btn-ghost join-item"
          onClick={() => {
            if (!monthValue) return;
            if (monthValue.month < 12) setMonthValue({ year: monthValue.year, month: monthValue.month + 1 });
            else setMonthValue({ year: monthValue.year + 1, month: 1 });
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-base-content/60 text-xs">Total revenue</p>
          <p className="text-sm text-primary">100.000đ</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">Total expenses</p>
          <p className="text-sm text-accent">80.000đ</p>
        </div>

        <div className="text-center">
          <p className="text-base-content/60 text-xs">Difference</p>
          <p className="text-sm text-success">20.000đ</p>
        </div>
      </div>
    </div>
  );
}

// export default function ExpenseOverview() {
//   const { t } = useTranslation();

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="flex flex-col gap-2 p-4 bg-base-100 rounded-xl">
//         <div className="flex flex-col">
//           <p className="text-base-content/60">{t('expenses.overview.totalMonthlyExpenses')}</p>
//           <p className="text-xl font-bold text-error">12.500.000đ</p>
//         </div>

//         <div className="flex flex-col">
//           <p className="text-base-content/60">{t('expenses.overview.averagePerDay')}</p>
//           <p className="text-lg font-semibold">416.000đ</p>
//         </div>
//       </div>

//       <div className="flex flex-col gap-2">
//         <p className="font-semibold text-lg">{t('expenses.overview.categories')}</p>

//         <div className="flex flex-col gap-1">
//           <div className="flex justify-between text-sm">
//             <span>{t('expenses.categories.food')}</span>
//             <span>5.600.000đ (45%)</span>
//           </div>
//           <progress className="progress progress-primary w-full" value="45" max="100"></progress>
//         </div>

//         <div className="flex flex-col gap-1">
//           <div className="flex justify-between text-sm">
//             <span>{t('expenses.categories.transportation')}</span>
//             <span>2.500.000đ (20%)</span>
//           </div>
//           <progress className="progress progress-secondary w-full" value="20" max="100"></progress>
//         </div>

//         <div className="flex flex-col gap-1">
//           <div className="flex justify-between text-sm">
//             <span>{t('expenses.categories.housing')}</span>
//             <span>1.800.000đ (15%)</span>
//           </div>
//           <progress className="progress progress-accent w-full" value="15" max="100"></progress>
//         </div>
//       </div>
//     </div>
//   );
// }
