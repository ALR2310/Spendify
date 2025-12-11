import dayjs from 'dayjs';
import { CalendarDaysIcon, Pencil, Plus } from 'lucide-react';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { NewCategory } from '@/database/types/tables/categories';
import { ExpenseTypeEnum, NewExpense } from '@/database/types/tables/expenses';
import Combobox from '@/components/Combobox';
import { CurrencyInput } from '@/components/CurrencyInput';
import Modal, { ModalRef } from '@/components/Modal';
import {
  useCategoryByIdQuery,
  useCategoryCreateMutation,
  useCategoryListQuery,
  useCategoryUpdateMutation,
} from '@/hooks/apis/category.hook';
import { useExpenseByIdQuery, useExpenseCreateMutation, useExpenseUpdateMutation } from '@/hooks/apis/expense.hook';
import { useDayPickerContext } from '@/hooks/app/useDayPicker';
import { useEmojiPickerContext } from '@/hooks/app/useEmojiPicker';

interface ExpenseUpsertContextType {
  openModal(expenseId?: number): void;
  closeModal(): void;
}

const ExpenseUpsertContext = createContext<ExpenseUpsertContextType>(null!);

const ExpenseUpsertProvider = ({ children }: { children: React.ReactNode }) => {
  const modalRef = useRef<ModalRef>(null!);
  const [expenseId, setExpenseId] = useState<number | null>(null);

  const ctx = useMemo(
    () => ({
      openModal: (expenseId: number) => {
        setExpenseId(expenseId);
        modalRef.current.showModal();
      },
      closeModal: () => {
        setExpenseId(null);
        modalRef.current.close();
      },
    }),
    [],
  );

  return (
    <ExpenseUpsertContext.Provider value={ctx}>
      {children}
      <ExpenseModal modalRef={modalRef} expenseId={expenseId} />
    </ExpenseUpsertContext.Provider>
  );
};

const ExpenseModal = ({ modalRef, expenseId }: { modalRef: React.RefObject<ModalRef>; expenseId?: number | null }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const categoryModalRef = useRef<HTMLDialogElement>(null!);

  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [type, setType] = useState<ExpenseTypeEnum>(ExpenseTypeEnum.Expense);
  const [note, setNote] = useState<string>('');

  const { date, setDate, open: openDatePicker } = useDayPickerContext();

  const { data: categories } = useCategoryListQuery();
  const { data: expense, isLoading: isLoadingExpense } = useExpenseByIdQuery(expenseId!);
  const { mutateAsync: createExpense } = useExpenseCreateMutation();
  const { mutateAsync: updateExpense } = useExpenseUpdateMutation();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (expenseId === null) {
      // Reset when creating new expense
      setAmount(0);
      setCategoryId(undefined);
      setDate(new Date());
      setType(ExpenseTypeEnum.Expense);
      setNote('');
    }
  }, [expenseId, setDate]);

  // Populate form when editing an expense
  useEffect(() => {
    if (expense && !isLoadingExpense) {
      setAmount(expense.amount);
      setCategoryId(expense.categoryId);
      setDate(new Date(expense.date));
      setType(expense.type);
      setNote(expense.note || '');
    }
  }, [expense, isLoadingExpense, setDate]);

  const categoryOptions = useMemo(
    () =>
      categories?.map((category) => ({
        label: `${category.icon ? `${category.icon} ` : ''}${category.name}`,
        value: String(category.id),
      })) || [],
    [categories],
  );

  const handleCreateOrUpdate = async () => {
    if (!categoryId) {
      toast.error('Please select a category.');
      return;
    }

    if (!date) {
      toast.error('Please select a date.');
      return;
    }

    const now = new Date().toISOString();
    const data: NewExpense = { categoryId, amount: amount, date: date.toISOString(), type, note, updatedAt: now };

    try {
      if (expenseId) {
        await updateExpense({ id: expenseId, data });
      } else {
        await createExpense({ ...data, createdAt: now });
      }

      modalRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ['expenses/getList'] });
      toast.success(
        `${t('expenses.form.expense')} ${expenseId ? t('expenses.form.updated') : t('expenses.form.created')} ${t('expenses.form.successfully')}.`,
      );
    } catch (err) {
      toast.error(t('expenses.form.errorSaving'));
    }
  };

  return (
    <>
      <Modal
        ref={modalRef}
        title={
          <p className="text-center">{`${expenseId ? t('expenses.form.edit') : t('expenses.form.new')} ${t('expenses.form.expense')}`}</p>
        }
        iconClose={false}
        buttonSubmit={{
          show: true,
          onClick: handleCreateOrUpdate,
        }}
      >
        <div className="space-y-4">
          <label className="floating-label">
            <span>{t('expenses.form.amount')}</span>
            <CurrencyInput value={amount} onChange={setAmount} placeholder={t('expenses.form.amount')} />
          </label>

          <div className="flex gap-4">
            <Combobox
              size="lg"
              value={String(categoryId)}
              placeholder="Select category"
              floatingLabel={true}
              onChange={(val) => setCategoryId(Number(val))}
              options={categoryOptions}
              render={(option) => (
                <div className="w-full flex items-center justify-between px-1">
                  <span className="line-clamp-1">{option.label}</span>
                  <button
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={() => categoryModalRef.current.showModal()}
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            />

            <button type="button" className="btn btn-lg btn-soft" onClick={() => categoryModalRef.current?.showModal()}>
              <Plus size={20} />
            </button>
          </div>

          <label className="floating-label">
            <span>{t('expenses.form.date')}</span>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              className="input input-lg"
              readOnly
              value={date ? dayjs(date).format('DD/MM/YYYY') : ''}
              onClick={() => openDatePicker()}
            />
            <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
          </label>

          <label className="floating-label">
            <span>{t('expenses.filter.type')}</span>
            <select
              className="select select-lg capitalize"
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
              className="input input-lg"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </Modal>

      <CategoryModal modalRef={categoryModalRef} categoryId={categoryId} />
    </>
  );
};

const CategoryModal = ({
  modalRef,
  categoryId,
}: {
  modalRef: React.RefObject<ModalRef>;
  categoryId?: number | null;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('');
  const [color, setColor] = useState<string>('');

  const { emoji, setEmoji, open: openPicker } = useEmojiPickerContext();

  const { data: category, isLoading: isLoadingCategory } = useCategoryByIdQuery(categoryId!);
  const { mutateAsync: createCategory } = useCategoryCreateMutation();
  const { mutateAsync: updateCategory } = useCategoryUpdateMutation();

  useEffect(() => {
    if (category && !isLoadingCategory) {
      setName(category.name);
      setIcon(category.icon || '');
      setColor(category.color || '');
      setEmoji(category.icon || undefined);
    }
  }, [category, isLoadingCategory, setEmoji]);

  useEffect(() => {
    if (!categoryId) {
      setName('');
      setIcon('');
      setColor('');
      setEmoji(undefined);
    }
  }, [categoryId, setEmoji]);

  useEffect(() => {
    if (emoji) setIcon(emoji);
  }, [emoji]);

  const handleCreateOrUpdate = async () => {
    if (!name) {
      toast.error(t('expenses.form.nameRequired'));
      return;
    }

    const now = new Date().toISOString();
    const data: NewCategory = { name, icon, color, updatedAt: now };

    try {
      if (categoryId) {
        await updateCategory({ id: categoryId, data });
      } else {
        await createCategory({ ...data, createdAt: now });
      }

      modalRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ['categories/getList'] });
      toast.success(
        `${t('expenses.filter.category')} ${categoryId ? t('expenses.form.updated') : t('expenses.form.created')} ${t('expenses.form.successfully')}.`,
      );
    } catch (err) {
      toast.error(t('expenses.form.errorSavingCategory'));
    }
  };

  return (
    <Modal
      title={`${categoryId ? t('expenses.form.edit') : t('expenses.form.new')} ${t('expenses.filter.category')}`}
      ref={modalRef}
      iconClose={false}
      buttonSubmit={{
        show: true,
        onClick: handleCreateOrUpdate,
      }}
    >
      <div className="space-y-4">
        <label className="floating-label">
          <span>{t('expenses.form.name')}</span>
          <input
            type="text"
            placeholder={t('expenses.form.categoryName')}
            className="input input-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <label className="floating-label flex-1">
            <span>{t('expenses.form.emoji')}</span>
            <input
              type="text"
              placeholder={t('expenses.form.emoji')}
              className="input input-lg"
              readOnly
              value={icon}
              onClick={openPicker}
            />
          </label>

          <label className="floating-label flex-1">
            <span>{t('expenses.form.color')}</span>
            <input
              type="color"
              placeholder={t('expenses.form.color')}
              className="input input-lg"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
};

export { ExpenseUpsertContext, ExpenseUpsertProvider };
export type { ExpenseUpsertContextType };
