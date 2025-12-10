import { createContext, RefObject, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer, { type DrawerRef } from '@/components/Drawer';

interface EmojiItem {
  id: number;
  code: string;
  emoji: string;
  name: string;
  nameUrl: string;
  category: string;
}

type EmojiPickerSession = {
  onChange?: (emoji?: EmojiItem) => void;
};

interface EmojiPickerContextValue {
  open: (onChange?: (emoji?: EmojiItem) => void) => void;
  close: () => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextValue>(null!);

function EmojiPickerProvider({ children }: { children: React.ReactNode }) {
  const drawerRef = useRef<DrawerRef>(null!);
  const [session, setSession] = useState<EmojiPickerSession | null>(null);
  const [list, setList] = useState<EmojiItem[]>([]);

  const open = async (onChange?: (emoji?: EmojiItem) => void) => {
    const { default: emojiData } = await import('../assets/data/emojis.json');
    setList(emojiData);
    setSession({ onChange });
    drawerRef.current?.openDrawer();
  };

  const close = () => {
    drawerRef.current?.close();
    setSession(null);
  };

  const handleSelect = (emoji?: EmojiItem) => {
    if (session?.onChange) {
      session.onChange(emoji);
    }
    close();
  };

  const ctx = useMemo(() => ({ open, close }), []);

  return (
    <EmojiPickerContext.Provider value={ctx}>
      {children}
      <EmojiPickerDrawer drawerRef={drawerRef} list={list} onSelect={handleSelect} close={close} />
    </EmojiPickerContext.Provider>
  );
}

function EmojiPickerDrawer({
  drawerRef,
  list,
  onSelect,
  close,
}: {
  drawerRef: RefObject<DrawerRef>;
  list: EmojiItem[];
  onSelect: (emoji?: EmojiItem) => void;
  close: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(list.map((e) => e.category));
    return ['all', ...Array.from(set)];
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = list;

    // Filter by category (disabled when search active)
    if (activeCategory !== 'all' && !q) {
      result = result.filter((e) => e.category === activeCategory);
    }

    // Filter by text
    if (q) {
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.nameUrl.toLowerCase().includes(q) || e.emoji.includes(q),
      );
    }

    return result;
  }, [query, list, activeCategory]);

  const handleSelect = (item: EmojiItem) => {
    onSelect(item);
  };

  return (
    <Drawer ref={drawerRef} position="bottom" className="h-[60vh] w-full rounded-t-2xl" onClose={close}>
      <div className="p-4 pb-[env(safe-area-inset-bottom)] flex flex-col min-h-0">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-3">
          <h3 className="font-semibold text-lg">{t('pickers.emojiPicker.title')}</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={close}>
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-sm border 
                ${activeCategory === c ? 'bg-primary text-primary-content border-primary' : 'border-base-300'}`}
            >
              {c === 'all' ? t('pickers.emojiPicker.all') : c}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={query}
          placeholder={t('pickers.emojiPicker.searchPlaceholder')}
          onChange={(e) => setQuery(e.target.value)}
          className="input input-bordered w-full mb-3"
        />

        {/* Emoji Grid */}
        <div className="grid grid-cols-6 gap-3 flex-1 overflow-y-auto p-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="text-3xl p-2 rounded-xl active:scale-95 transition cursor-pointer"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

export { EmojiPickerContext, EmojiPickerProvider };
export type { EmojiItem, EmojiPickerContextValue };
