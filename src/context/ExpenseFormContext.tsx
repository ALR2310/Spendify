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
import { NewRecurring, RecurringPeriodEnum } from '@/database/types/tables/recurring';
import { useDatePicker } from '@/global/datepicker';
import { useCategoryListQuery } from '@/hooks/apis/category.hook';
import {
  useExpenseByIdQuery,
  useExpenseCreateMutation,
  useExpenseUpdateMutation,
} from '@/hooks/apis/expense.hook';
import {
  useRecurringByIdQuery,
  useRecurringCreateMutation,
  useRecurringUpdateMutation,
} from '@/hooks/apis/recurring.hook';
import { useAppContext } from '@/hooks/app/useApp';
import { useCategoryFormContext } from '@/hooks/app/useCategory';

interface ExpenseFormContextType {
  openForm: (id?: number, type?: 'expenses' | 'recurring') => void;
  closeForm: () => void;
}

const ExpenseFormContext = createContext<ExpenseFormContextType>(null!);

const ExpenseFormProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState<number>();
  const [type, setType] = useState<'expenses' | 'recurring'>('expenses');
  const drawerRef = useRef<DrawerRef>(null!);

  const openForm = (id?: number, type?: 'expenses' | 'recurring') => {
    setId(id);
    setType(type ?? 'expenses');
    drawerRef.current?.openDrawer();
  };

  const closeForm = () => {
    setId(undefined);
    setType('expenses');
    drawerRef.current?.close();
  };

  return (
    <ExpenseFormContext.Provider value={{ openForm, closeForm }}>
      {children}
      <ExpenseFormDrawer drawerRef={drawerRef} id={id} formType={type} setFormType={setType} onClose={closeForm} />
    </ExpenseFormContext.Provider>
  );
};

const ExpenseFormDrawer = ({
  drawerRef,
  id,
  formType,
  setFormType,
  onClose,
}: {
  drawerRef: React.RefObject<DrawerRef>;
  id?: number;
  formType: 'expenses' | 'recurring';
  setFormType: (type: 'expenses' | 'recurring') => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [type, setType] = useState<ExpenseTypeEnum>(ExpenseTypeEnum.Expense);
  const [period, setPeriod] = useState<RecurringPeriodEnum>(RecurringPeriodEnum.Monthly);
  const [note, setNote] = useState<string>('');

  const { openForm: openCategoryForm } = useCategoryFormContext();

  const { date, setDate, open: openDatePicker } = useDatePicker(new Date());
  const { date: startDate, setDate: setStartDate, open: openStartDatePicker } = useDatePicker(new Date());
  const { date: endDate, setDate: setEndDate, open: openEndDatePicker } = useDatePicker();

  const { data: categories } = useCategoryListQuery();
  const { data: expense } = useExpenseByIdQuery(id!);
  const { data: recurring } = useRecurringByIdQuery(id!);

  const { mutateAsync: createExpense } = useExpenseCreateMutation();
  const { mutateAsync: updateExpense } = useExpenseUpdateMutation();
  const { mutateAsync: createRecurring } = useRecurringCreateMutation();
  const { mutateAsync: updateRecurring } = useRecurringUpdateMutation();
  const { syncData } = useAppContext();

  const categoryOptions = useMemo(
    () =>
      categories?.map((category) => ({
        label: `${category.icon ? `${category.icon} ` : ''}${category.name}`,
        value: String(category.id),
      })) || [],
    [categories],
  );

  // Track if form was initialized to avoid resetting on formType toggle
  const isInitialized = useRef(false);
  // Track last populated id to avoid re-populating same data
  const lastPopulatedId = useRef<number | undefined>(undefined);
  const lastPopulatedType = useRef<'expenses' | 'recurring' | undefined>(undefined);

  // Reset initialization flag when id changes or form closes
  useEffect(() => {
    isInitialized.current = false;
    lastPopulatedId.current = undefined;
    lastPopulatedType.current = undefined;
  }, [id]);

  useEffect(() => {
    if (!id) {
      // Only reset form for new expense if not initialized yet
      if (!isInitialized.current) {
        setAmount(0);
        setCategoryId(undefined);
        setDate(new Date());
        setStartDate(new Date());
        setType(ExpenseTypeEnum.Expense);
        setNote('');
        setPeriod(RecurringPeriodEnum.Monthly);
        isInitialized.current = true;
      } else {
        // When toggling formType, only reset incompatible fields
        // Keep common fields: amount, categoryId, type, note
        if (formType === 'expenses') {
          // Switching to expenses: reset recurring-specific fields
          // Only set if date is not already set
          setDate((prevDate) => prevDate || new Date());
        } else {
          // Switching to recurring: reset expense-specific field
          // Only set if startDate is not already set
          setStartDate((prevStartDate) => prevStartDate || new Date());
        }
      }
    } else {
      // Editing existing item - populate from data
      // Only populate if id or type changed to avoid infinite loop
      const shouldPopulate = lastPopulatedId.current !== id || lastPopulatedType.current !== formType;

      if (formType === 'expenses' && expense && shouldPopulate) {
        setAmount(expense.amount);
        setCategoryId(expense.categoryId);
        setDate(new Date(expense.date));
        setType(expense.type);
        setNote(expense.note || '');
        isInitialized.current = true;
        lastPopulatedId.current = id;
        lastPopulatedType.current = formType;
      } else if (formType === 'recurring' && recurring && shouldPopulate) {
        setAmount(recurring.amount);
        setCategoryId(recurring.categoryId);
        setStartDate(new Date(recurring.startDate));
        setEndDate(recurring.endDate ? new Date(recurring.endDate) : undefined);
        setPeriod(recurring.period);
        setType(recurring.type);
        setNote(recurring.note || '');
        isInitialized.current = true;
        lastPopulatedId.current = id;
        lastPopulatedType.current = formType;
      }
    }
  }, [expense, formType, id, recurring, setDate, setEndDate, setStartDate]);

  const handleSubmit = async () => {
    if (!categoryId) return void toast.error('Please select a category.');
    if (amount <= 0) return void toast.error('Amount must be greater than 0.');

    if (formType === 'expenses') {
      if (!date) return void toast.error('Please select a date.');
    } else {
      if (!startDate) return void toast.error('Please select a start date.');
    }

    const now = new Date().toISOString();

    try {
      if (formType === 'expenses') {
        const expenseData: NewExpense = {
          categoryId,
          amount,
          date: date!.toISOString(),
          type,
          note,
          updatedAt: now,
        };

        if (id) {
          await updateExpense({ id: id, data: expenseData });
        } else {
          await createExpense({ ...expenseData, createdAt: now });
        }

        queryClient.invalidateQueries({ queryKey: ['expenses', 'getList'] });
        toast.success(
          `${t('expenses.form.expense')} ${id ? t('expenses.form.updated') : t('expenses.form.created')} ${t('expenses.form.successfully')}.`,
        );
      } else {
        const recurringData: NewRecurring = {
          categoryId,
          amount,
          startDate: startDate!.toISOString(),
          endDate: endDate?.toISOString(),
          period,
          type,
          note,
          updatedAt: now,
        };

        if (id) {
          await updateRecurring({ id: id, data: recurringData });
        } else {
          await createRecurring({ ...recurringData, createdAt: now });
        }

        queryClient.invalidateQueries({ queryKey: ['recurring', 'getList'] });
        toast.success(
          `Recurring ${id ? t('expenses.form.updated') : t('expenses.form.created')} ${t('expenses.form.successfully')}.`,
        );
      }

      setCategoryId(undefined);
      setAmount(0);
      setDate(new Date());
      setStartDate(new Date());
      setEndDate(undefined);
      setPeriod(RecurringPeriodEnum.Monthly);
      setType(ExpenseTypeEnum.Expense);
      setNote('');
      isInitialized.current = false;

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
        <h3 className="font-semibold text-lg">{`${id ? 'Edit' : 'Create'} Expense`}</h3>
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

        {formType === 'expenses' ? (
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
        ) : (
          <>
            <div className="flex items-center gap-4">
              <label className="floating-label">
                <span>{'Start Date'}</span>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  className="input input-lg w-full"
                  readOnly
                  value={startDate ? dayjs(startDate).format('DD/MM/YYYY') : ''}
                  onClick={() => openStartDatePicker()}
                />
                <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
              </label>

              <label className="floating-label">
                <span>{'End Date'}</span>
                <input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  className="input input-lg w-full"
                  readOnly
                  value={endDate ? dayjs(endDate).format('DD/MM/YYYY') : ''}
                  onClick={() => openEndDatePicker()}
                />
                <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
              </label>
            </div>

            <label className="floating-label">
              <span>Period</span>
              <select
                className="select select-lg capitalize w-full"
                value={period}
                onChange={(e) => setPeriod(e.target.value as RecurringPeriodEnum)}
              >
                {Object.entries(RecurringPeriodEnum).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <div className="flex items-center justify-between gap-4">
          <label className="floating-label flex-1">
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

          <label className="flex items-center gap-4">
            <span>Recurring:</span>
            <input
              type="checkbox"
              className="toggle toggle-lg checked:toggle-success"
              checked={formType === 'recurring'}
              onChange={(e) => setFormType(e.target.checked ? 'recurring' : 'expenses')}
            />
          </label>
        </div>

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
