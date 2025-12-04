import dayjs from 'dayjs';
import { CalendarDaysIcon, Plus } from 'lucide-react';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { NewCategory } from '@/common/database/types/tables/categories';
import { ExpenseTypeEnum, NewExpense } from '@/common/database/types/tables/expenses';
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

interface ExpenseUIContextType {
  openModal(expenseId?: number): void;
  closeModal(): void;
}

const ExpenseUIContext = createContext<ExpenseUIContextType>(null!);

const ExpenseUIProvider = ({ children }: { children: React.ReactNode }) => {
  const modalRef = useRef<ModalRef>(null!);
  const [expenseId, setExpenseId] = useState<number | null>(null);

  const openModal = (expenseId: number) => {
    setExpenseId(expenseId);
    modalRef.current.showModal();
  };

  const closeModal = () => {
    setExpenseId(null);
    modalRef.current.close();
  };

  const ctx = useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [],
  );

  return (
    <ExpenseUIContext.Provider value={ctx}>
      {children}
      <ExpenseModal modalRef={modalRef} expenseId={expenseId} />
    </ExpenseUIContext.Provider>
  );
};

const ExpenseModal = ({ modalRef, expenseId }: { modalRef: React.RefObject<ModalRef>; expenseId?: number | null }) => {
  const queryClient = useQueryClient();
  const categoryModalRef = useRef<HTMLDialogElement>(null!);

  const [amount, setAmount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [date, setDate] = useState<string>('');
  const [type, setType] = useState<ExpenseTypeEnum>(ExpenseTypeEnum.Expense);
  const [note, setNote] = useState<string>('');

  const { date: pickerValue, open: openPicker } = useDayPickerContext();

  const { data: categories } = useCategoryListQuery();
  const { data: expense, isLoading: isLoadingExpense } = useExpenseByIdQuery(expenseId!);
  const { mutateAsync: createExpense } = useExpenseCreateMutation();
  const { mutateAsync: updateExpense } = useExpenseUpdateMutation();

  // Populate form when editing an expense
  useEffect(() => {
    if (expense && !isLoadingExpense) {
      setAmount(expense.amount);
      setCategoryId(expense.categoryId);
      setDate(expense.date);
      setType(expense.type);
      setNote(expense.note || '');
    }
  }, [expense, isLoadingExpense]);

  // Update date when picker value changes
  useEffect(() => {
    if (pickerValue) setDate(pickerValue.toISOString());
  }, [pickerValue]);

  const handleCreateOrUpdate = async () => {
    const now = new Date().toISOString();
    const data: NewExpense = { categoryId, amount: amount, date, type, note, updatedAt: now };

    try {
      if (expenseId) {
        await updateExpense({ id: expenseId, data });
      } else {
        await createExpense({ ...data, createdAt: now });
      }

      setAmount(0);
      setCategoryId(1);
      setDate('');
      setType(ExpenseTypeEnum.Expense);
      setNote('');

      modalRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ['expenses/getList'] });
      toast.success(`Expense ${expenseId ? 'updated' : 'created'} successfully.`);
    } catch (err) {
      toast.error('An error occurred while saving the expense.');
    }
  };

  return (
    <>
      <Modal
        ref={modalRef}
        title={<p className="text-center">{`${expenseId ? `Edit` : `New`} Expense`}</p>}
        iconClose={false}
        buttonSubmit={{
          show: true,
          onClick: handleCreateOrUpdate,
        }}
      >
        <div className="space-y-4">
          <label className="floating-label">
            <span>Amount</span>
            <CurrencyInput value={amount} onChange={setAmount} placeholder="Amount" />
          </label>

          <div className="flex gap-4">
            <select
              className="select select-lg capitalize"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>

            <button type="button" className="btn btn-lg btn-soft" onClick={() => categoryModalRef.current?.showModal()}>
              <Plus size={20} />
            </button>
          </div>

          <label className="floating-label">
            <span>Date</span>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              className="input input-lg"
              readOnly
              value={date ? dayjs(date).format('DD/MM/YYYY') : ''}
              onClick={() => openPicker()}
            />
            <CalendarDaysIcon size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 pe-1" />
          </label>

          <label className="floating-label">
            <span>Type</span>
            <select
              className="select select-lg capitalize"
              value={type}
              onChange={(e) => setType(e.target.value as ExpenseTypeEnum)}
            >
              {Object.entries(ExpenseTypeEnum).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="floating-label">
            <span>Note</span>
            <input
              type="text"
              placeholder="Note"
              className="input input-lg"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
      </Modal>

      <CategoryModal modalRef={categoryModalRef} />
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
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('');
  const [color, setColor] = useState<string>();

  const { emoji, open: openPicker } = useEmojiPickerContext();

  const { data: category, isLoading: isLoadingCategory } = useCategoryByIdQuery(categoryId!);
  const { mutateAsync: createCategory } = useCategoryCreateMutation();
  const { mutateAsync: updateCategory } = useCategoryUpdateMutation();

  useEffect(() => {
    if (category && !isLoadingCategory) {
      setName(category.name);
      setIcon(category.icon || '');
      setColor(category.color);
    }
  }, [category, isLoadingCategory]);

  useEffect(() => {
    if (emoji) setIcon(emoji);
  }, [emoji]);

  const handleCreateOrUpdate = async () => {
    if (!name) {
      toast.error('Name is required.');
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

      setName('');
      setIcon('');
      setColor(undefined);

      modalRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ['categories/getList'] });
      toast.success(`Category ${categoryId ? 'updated' : 'created'} successfully.`);
    } catch (err) {
      toast.error('An error occurred while saving the category.');
    }
  };

  return (
    <Modal
      title={`${categoryId ? 'Edit' : 'New'} Category`}
      ref={modalRef}
      iconClose={false}
      buttonSubmit={{
        show: true,
        onClick: handleCreateOrUpdate,
      }}
    >
      <div className="space-y-4">
        <label className="floating-label">
          <span>Name</span>
          <input
            type="text"
            placeholder="Category Name"
            className="input input-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-2">
          <label className="floating-label flex-1">
            <span>Emoji</span>
            <input
              type="text"
              placeholder="Emoji"
              className="input input-lg"
              readOnly
              value={icon}
              onClick={openPicker}
            />
          </label>

          <label className="floating-label flex-1">
            <span>Color</span>
            <input
              type="color"
              placeholder="Category Color"
              className="input input-lg"
              value={color}
              onChange={(e) => setIcon(e.target.value)}
            />
          </label>
        </div>
      </div>
    </Modal>
  );
};

export { ExpenseUIContext, ExpenseUIProvider };
export type { ExpenseUIContextType };
