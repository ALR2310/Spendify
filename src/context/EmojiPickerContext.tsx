import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';

import Drawer, { type DrawerRef } from '@/components/Drawer';

interface EmojiItem {
  id: number;
  code: string;
  emoji: string;
  name: string;
  nameUrl: string;
  category: string;
}

interface InternalState {
  resolve?: (val?: EmojiItem) => void;
}

interface EmojiPickerContextValue {
  openPicker: () => Promise<EmojiItem | undefined>;
  closePicker: () => void;
  isOpen: boolean;
  list: EmojiItem[];
  selectEmoji: (item: EmojiItem) => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextValue>(null!);

function EmojiPickerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [list, setList] = useState<EmojiItem[]>([]);
  const [internal, setInternal] = useState<InternalState>({});

  const openPicker = async () => {
    const { default: emojiData } = await import('../assets/data/emojis.json');

    setList(emojiData); // full list

    return new Promise<EmojiItem | undefined>((resolve) => {
      setInternal({ resolve });
      setIsOpen(true);
    });
  };

  const closePicker = () => {
    internal.resolve?.(undefined);
    setIsOpen(false);
  };

  const selectEmoji = (item: EmojiItem) => {
    internal.resolve?.(item);
    setIsOpen(false);
  };

  return (
    <EmojiPickerContext.Provider
      value={{
        openPicker,
        closePicker,
        isOpen,
        list,
        selectEmoji,
      }}
    >
      {children}
      <EmojiPickerDrawer />
    </EmojiPickerContext.Provider>
  );
}

function EmojiPickerDrawer() {
  const { isOpen, closePicker, list, selectEmoji } = useContext(EmojiPickerContext);
  const drawerRef = useRef<DrawerRef>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.openDrawer();
    } else {
      drawerRef.current?.close();
    }
  }, [isOpen]);

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

  return (
    <Drawer ref={drawerRef} position="bottom" className="h-[60vh] w-full rounded-t-2xl" onClose={closePicker}>
      <div className="p-4 pb-[env(safe-area-inset-bottom)] flex flex-col min-h-0">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-3">
          <h3 className="font-semibold text-lg">Select Emoji</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={closePicker}>
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
              {c === 'all' ? 'Tất cả' : c}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={query}
          placeholder="Tìm emoji…"
          onChange={(e) => setQuery(e.target.value)}
          className="input input-bordered w-full mb-3"
        />

        {/* Emoji Grid */}
        <div className="grid grid-cols-6 gap-3 flex-1 overflow-y-auto p-1">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => selectEmoji(item)}
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
export type { EmojiItem };
