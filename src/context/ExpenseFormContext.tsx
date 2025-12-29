import dayjs from 'dayjs';
import { CalendarDaysIcon, Pencil, Plus } from 'lucide-react';
import React, { createContext, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { logger } from '@/common/logger';
import Combobox from '@/components/Combobox';
import { CurrencyInput } from '@/components/CurrencyInput';
import Drawer, { DrawerRef } from '@/components/Drawer';
import { ExpenseTypeEnum, NewExpense } from '@/database/types/tables/expenses';
import { useDatePicker } from '@/global/datepicker';
import { useCategoryListQuery } from '@/hooks/apis/category.hook';
import {
  useExpenseByIdQuery,
  useExpenseCreateMutation,
  useExpenseUpdateMutation,
} from '@/hooks/apis/expense.hook';
import { useAppContext } from '@/hooks/app/useApp';
import { useCategoryFormContext } from '@/hooks/app/useCategory';

interface ExpenseFormContextType {
  openForm: (expenseId?: number) => void;
  closeForm: () => void;
}

const ExpenseFormContext = createContext<ExpenseFormContextType>(null!);

const ExpenseFormProvider = ({ children }: { children: ReactNode }) => {
  const [expenseId, setExpenseId] = useState<number>();
  const drawerRef = useRef<DrawerRef>(null!);

  const openForm = (expenseId?: number) => {
    setExpenseId(expenseId);
    drawerRef.current?.openDrawer();
  };

  const closeForm = () => {
    setExpenseId(undefined);
    drawerRef.current?.close();
  };

  return (
    <ExpenseFormContext.Provider value={{ openForm, closeForm }}>
      {children}
      <ExpenseFormDrawer drawerRef={drawerRef} expenseId={expenseId} onClose={closeForm} />
    </ExpenseFormContext.Provider>
  );
};

const ExpenseFormDrawer = ({
  drawerRef,
  expenseId,
  onClose,
}: {
  drawerRef: React.RefObject<DrawerRef>;
  expenseId?: number;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [type, setType] = useState<ExpenseTypeEnum>(ExpenseTypeEnum.Expense);
  const [note, setNote] = useState<string>('');

  const { openForm: openCategoryForm } = useCategoryFormContext();

  const { date, setDate, open: openDatePicker } = useDatePicker();

  const { data: categories } = useCategoryListQuery();
  const { data: expense } = useExpenseByIdQuery(expenseId!);
  const { mutateAsync: createExpense } = useExpenseCreateMutation();
  const { mutateAsync: updateExpense } = useExpenseUpdateMutation();
  const { syncData } = useAppContext();

  const categoryOptions = useMemo(
    () =>
      categories?.map((category) => ({
        label: `${category.icon ? `${category.icon} ` : ''}${category.name}`,
        value: String(category.id),
      })) || [],
    [categories],
  );

  useEffect(() => {
    if (!expenseId) {
      // Reset form for new expense
      setAmount(0);
      setCategoryId(undefined);
      setDate(new Date());
      setType(ExpenseTypeEnum.Expense);
      setNote('');
    }

    if (expenseId && expense) {
      // Populate form for editing existing expense
      setAmount(expense.amount);
      setCategoryId(expense.categoryId);
      setDate(new Date(expense.date));
      setType(expense.type);
      setNote(expense.note || '');
    }
  }, [expense, expenseId, setDate]);

  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error('Please select a category.');
      return;
    }

    if (!date) {
      toast.error('Please select a date.');
      return;
    }

    const now = new Date().toISOString();

    const data: NewExpense = { categoryId, amount, date: date.toISOString(), type, note, updatedAt: now };

    try {
      if (expenseId) {
        await updateExpense({ id: expenseId, data });
      } else {
        await createExpense({ ...data, createdAt: now });
      }

      queryClient.invalidateQueries({ queryKey: ['expenses', 'getList'] });
      toast.success(
        `${t('expenses.form.expense')} ${expenseId ? t('expenses.form.updated') : t('expenses.form.created')} ${t('expenses.form.successfully')}.`,
      );

      setCategoryId(undefined);
      setAmount(0);
      setDate(new Date());
      setType(ExpenseTypeEnum.Expense);
      setNote('');

      onClose();
      syncData();
    } catch (error) {
      logger.error('Error saving expense:', error);
      toast.error(t('expenses.form.errorSaving'));
    }
  };

  return (
    <Drawer
      ref={drawerRef}
      classNames={{ drawer: 'px-0 z-99!', overlay: 'z-99!' }}
      position="bottom"
      onClose={onClose}
    >
      {/* Header */}
      <div className="relative flex items-center justify-center border-base-300">
        <h3 className="font-semibold text-lg">{`${expenseId ? 'Edit' : 'Create'} Expense`}</h3>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="divider m-0"></div>

      {/* Content */}
      <div className="space-y-4 p-4">
        <label className="floating-label">
          <span>{t('expenses.form.amount')}</span>
          <CurrencyInput
            className="w-full"
            value={amount}
            onChange={setAmount}
            placeholder={t('expenses.form.amount')}
          />
        </label>

        <div className="flex gap-4 w-full">
          <Combobox
            size="lg"
            value={String(categoryId)}
            classNames={{ container: 'flex-1' }}
            placeholder="Select category"
            floatingLabel={true}
            onChange={(val) => setCategoryId(Number(val))}
            options={categoryOptions}
            render={(option) => (
              <div className="w-full flex items-center justify-between px-1">
                <span className="line-clamp-1">{option.label}</span>
                <button className="btn btn-sm btn-circle btn-ghost" onClick={() => openCategoryForm(categoryId)}>
                  <Pencil size={16} />
                </button>
              </div>
            )}
          />

          <button type="button" className="btn btn-lg btn-soft" onClick={() => openCategoryForm()}>
            <Plus size={20} />
          </button>
        </div>

        <label className="floating-label">
          <span>{t('expenses.form.date')}</span>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            className="input input-lg w-full"
            readOnly
            value={date ? dayjs(date).format('DD/MM/YYYY') : ''}
            onClick={() => openDatePicker()}
          />
          <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
        </label>

        <label className="floating-label">
          <span>{t('expenses.filter.type')}</span>
          <select
            className="select select-lg capitalize w-full"
            value={type}
            onChange={(e) => setType(e.target.value as ExpenseTypeEnum)}
          >
            {Object.entries(ExpenseTypeEnum).map(([key, value]) => (
              <option key={key} value={value}>
                {t(`expenses.filter.${value.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="floating-label">
          <span>{t('expenses.form.note')}</span>
          <input
            type="text"
            placeholder={t('expenses.form.note')}
            className="input input-lg w-full"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>

      {/* Button */}
      <div className="flex items-center gap-2 p-4 border-t border-base-content/10">
        <button className="btn btn-ghost rounded-xl flex-1" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-success rounded-xl flex-1" onClick={handleSubmit}>
          Save
        </button>
      </div>
    </Drawer>
  );
};

export { ExpenseFormContext, ExpenseFormProvider };
export type { ExpenseFormContextType };
