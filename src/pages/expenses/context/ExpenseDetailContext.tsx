import dayjs from 'dayjs';
import { CalendarDaysIcon, CircleAlert, MessageSquare, Pencil, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { ExpenseTypeEnum } from '@/common/database/types/tables/expenses';
import Drawer, { DrawerRef } from '@/components/Drawer';
import Skeleton from '@/components/Skeleton';
import { confirm } from '@/global/confirm';
import { useExpenseByIdQuery, useExpenseDeleteMutation } from '@/hooks/apis/expense.hook';
import { useExpenseUpsertContext } from '@/hooks/app/useExpense';
import { formatCurrency } from '@/utils/general.utils';

interface ExpenseDetailContextValue {
  showDetail: (expenseId: number) => void;
  closeDetail: () => void;
}

const ExpenseDetailContext = createContext<ExpenseDetailContextValue>(null!);

const ExpenseDetailProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expenseId, setExpenseId] = useState<number | null>(null);

  const ctx = useMemo<ExpenseDetailContextValue>(
    () => ({
      showDetail: (id: number) => {
        setExpenseId(id);
        setIsOpen(true);
      },
      closeDetail: () => {
        setIsOpen(false);
        setExpenseId(null);
      },
    }),
    [],
  );

  return (
    <ExpenseDetailContext.Provider value={ctx}>
      {children}
      <ExpenseDetailDrawer isOpen={isOpen} expenseId={expenseId} onClose={() => ctx.closeDetail()} />
    </ExpenseDetailContext.Provider>
  );
};

const ExpenseDetailDrawer = ({
  isOpen,
  expenseId,
  onClose,
}: {
  isOpen: boolean;
  expenseId: number | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const drawerRef = useRef<DrawerRef>(null);

  const { openModal } = useExpenseUpsertContext();
  const { data: expense, isLoading } = useExpenseByIdQuery(expenseId!);
  const { mutateAsync: deleteExpense } = useExpenseDeleteMutation();

  useEffect(() => {
    if (isOpen) drawerRef.current?.openDrawer();
    else drawerRef.current?.close();
  }, [isOpen]);

  const handleClose = () => {
    drawerRef.current?.close();
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = await confirm(
      'Are you sure you want to delete this expense?. This action cannot be undone.',
      <span className="inline-flex items-center gap-2 text-error font-semibold">
        <CircleAlert />
        Confirm Deletion
      </span>,
    );
    if (!confirmed) return;

    try {
      await deleteExpense(expenseId!);
      queryClient.invalidateQueries(['expenses/getList']);
      handleClose();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    }
  };

  const handleEdit = () => {
    handleClose();
    openModal(expenseId!);
  };

  return (
    <Drawer ref={drawerRef} position="bottom" onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative flex items-center justify-center border-base-300">
          <h3 className="font-semibold text-lg">{t('expenses.detail.title')}</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="divider m-0"></div>

        <div className="flex-1 overflow-y-auto space-y-4 px-2">
          {/* Category */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl">{isLoading ? <Skeleton className="w-20 h-12" /> : expense?.categoryIcon}</div>

            {isLoading ? (
              <Skeleton className="w-[70%] h-7" />
            ) : (
              <h2 className="font-semibold text-xl">{expense?.categoryName}</h2>
            )}
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm opacity-60">{t('expenses.detail.amount')}</span>
            {isLoading ? (
              <Skeleton className="w-[50%] h-8" />
            ) : (
              <span
                className={`text-2xl font-bold ${
                  expense?.type === ExpenseTypeEnum.Income ? 'text-success' : 'text-error'
                }`}
              >
                {formatCurrency(expense?.amount ?? 0)}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Date */}
            <div className="card bg-base-200 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success">
                  <CalendarDaysIcon size={20} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs opacity-60">{t('expenses.detail.transactionDate')}</span>
                  {isLoading ? (
                    <Skeleton className="w-[60%] h-6" />
                  ) : (
                    <span className="font-semibold">{dayjs(expense?.date).format('DD/MM/YYYY')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Type */}
            <div className="card bg-base-200 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                    expense?.type === ExpenseTypeEnum.Income ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}
                >
                  {expense?.type === ExpenseTypeEnum.Income ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs opacity-60">{t('expenses.detail.transactionType')}</span>
                  {isLoading ? (
                    <Skeleton className="w-[60%] h-6" />
                  ) : (
                    <span className="font-semibold capitalize">
                      {t(`expenses.detail.${expense?.type === ExpenseTypeEnum.Income ? 'income' : 'expense'}`)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Note */}
            {expense?.note && (
              <div className="card bg-base-200 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-xs opacity-60">{t('expenses.detail.note')}</span>
                    <span className="font-medium">{expense.note}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 pb-2 border-base-300">
          <button className="btn btn-lg btn-ghost flex-1" onClick={handleClose}>
            {t('expenses.detail.close')}
          </button>
          <button className="btn btn-lg btn-error btn-soft flex-1 gap-2" onClick={handleDelete}>
            <Trash2 size={18} />
            {t('expenses.detail.delete')}
          </button>
          <button className="btn btn-lg btn-success btn-soft flex-1 gap-2" onClick={handleEdit}>
            <Pencil size={18} />
            {t('expenses.detail.edit')}
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export { ExpenseDetailContext, ExpenseDetailProvider };
export type { ExpenseDetailContextValue as ExpenseDetailContextType };
