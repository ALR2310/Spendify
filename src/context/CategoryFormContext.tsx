import { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import { logger } from '@/common/logger';
import Drawer, { DrawerRef } from '@/components/Drawer';
import Skeleton from '@/components/Skeleton';
import { NewCategory } from '@/database/types/tables/categories';
import {
  useCategoryByIdQuery,
  useCategoryCreateMutation,
  useCategoryListQuery,
  useCategoryUpdateMutation,
} from '@/hooks/apis/category.hook';
import { useAppContext } from '@/hooks/app/useApp';
import { useEmojiPickerContext } from '@/hooks/app/useEmojiPicker';

interface CategoryFormContextType {
  openForm: (categoryId?: number) => void;
  closeForm: () => void;
}

const CategoryFormContext = createContext<CategoryFormContextType>(null!);

const CategoryFormProvider = ({ children }: { children: ReactNode }) => {
  const [categoryId, setCategoryId] = useState<number>();
  const drawerRef = useRef<DrawerRef>(null!);

  const openForm = (categoryId?: number) => {
    setCategoryId(categoryId);
    drawerRef.current?.openDrawer();
  };

  const closeForm = () => {
    setCategoryId(undefined);
    drawerRef.current?.close();
  };

  return (
    <CategoryFormContext.Provider value={{ openForm, closeForm }}>
      {children}
      <CategoryFormDrawer
        drawerRef={drawerRef}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        onClose={closeForm}
      />
    </CategoryFormContext.Provider>
  );
};

const CategoryFormDrawer = ({
  drawerRef,
  categoryId,
  setCategoryId,
  onClose,
}: {
  drawerRef: React.RefObject<DrawerRef>;
  categoryId?: number;
  setCategoryId: (id: number | undefined) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('');
  const [color, setColor] = useState<string>('');

  const { emoji, setEmoji, open: openPicker } = useEmojiPickerContext();

  const { data: categories, isLoading: isCategoryLoading } = useCategoryListQuery();
  const { data: category } = useCategoryByIdQuery(categoryId!);
  const { mutateAsync: createCategory } = useCategoryCreateMutation();
  const { mutateAsync: updateCategory } = useCategoryUpdateMutation();
  const { syncData } = useAppContext();

  useEffect(() => {
    if (!category) {
      // Reset form for new category
      setName('');
      setEmoji(undefined);
      setColor('#000000');
    }

    if (categoryId && category) {
      setName(category.name);
      setEmoji(category.icon);
      setColor(category.color || '#000000');
    }
  }, [category, categoryId, setEmoji]);

  useEffect(() => {
    if (emoji) setIcon(emoji);
  }, [emoji]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return void toast.error(t('expenses.form.nameRequired'));
    }

    const now = new Date().toISOString();
    const data: NewCategory = { name, icon, color, updatedAt: now };

    try {
      if (categoryId) {
        await updateCategory({ id: categoryId, data });
      } else {
        await createCategory({ ...data, createdAt: now });
      }

      queryClient.invalidateQueries({ queryKey: ['categories', 'getList'] });
      toast.success(
        `${t('expenses.filter.category')} ${categoryId ? t('expenses.form.updated') : t('expenses.form.created')} ${t('expenses.form.successfully')}.`,
      );

      setCategoryId(undefined);
      setName('');
      setIcon('');
      setColor('#000000');

      onClose();
      syncData();
    } catch (error) {
      logger.error('Error saving category:', error);
      toast.error(t('expenses.form.errorSavingCategory'));
    }
  };

  return (
    <Drawer
      ref={drawerRef}
      position="bottom"
      classNames={{
        drawer: 'px-0 h-[80vh] z-100!',
        overlay: 'z-100!',
      }}
      onClose={onClose}
    >
      {/* Header */}
      <div className="relative flex items-center justify-center border-base-300">
        <h3 className="font-semibold text-lg">{`${categoryId ? 'Edit' : 'Create'} Category`}</h3>
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="divider m-0"></div>

      {/* Content */}
      <div className="space-y-4 p-4 h-full overflow-auto">
        <label className="floating-label">
          <span>{t('expenses.form.name')}</span>
          <input
            type="text"
            placeholder={t('expenses.form.categoryName')}
            className="input input-lg w-full"
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

        {/* List */}
        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
          {isCategoryLoading && <Skeleton className="w-full h-12" />}
          {!isCategoryLoading && categories?.length === 0 && (
            <p className="text-center col-span-3">No categories found</p>
          )}
          {!isCategoryLoading &&
            categories?.map((category) => (
              <button
                key={category.id}
                className={`btn btn-soft btn-lg flex flex-col items-center gap-0`}
                onClick={() => setCategoryId(category.id)}
              >
                <span>{category.icon}</span>
                <span className="text-xs line-clamp-1">{category.name}</span>
              </button>
            ))}
        </div>
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

export { CategoryFormContext, CategoryFormProvider };
export type { CategoryFormContextType };
