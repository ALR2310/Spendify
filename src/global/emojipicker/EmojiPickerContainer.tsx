import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Drawer, { type DrawerRef } from '@/components/Drawer';

import { EmojiItem, emojiPickerBus, EmojiPickerEvents } from './emojiPickerBus';

export default function EmojiPickerContainer() {
  const { t } = useTranslation();
  const drawerRef = useRef<DrawerRef>(null);
  const [list, setList] = useState<EmojiItem[]>([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPickerId, setCurrentPickerId] = useState<string | undefined>(undefined);

  const handleOpen = useCallback(async (data: EmojiPickerEvents['open']) => {
    const { default: emojiData } = await import('../../assets/data/emojis.json');
    setList(emojiData);
    setCurrentPickerId(data.pickerId);
    drawerRef.current?.openDrawer();
  }, []);

  const handleClose = useCallback(() => {
    drawerRef.current?.close();
    setQuery('');
    setActiveCategory('all');
  }, []);

  const handleSelect = useCallback(
    (item: EmojiItem) => {
      emojiPickerBus.emit('select', { emoji: item, pickerId: currentPickerId });
      handleClose();
    },
    [currentPickerId, handleClose],
  );

  useEffect(() => {
    emojiPickerBus.on('open', handleOpen);
    emojiPickerBus.on('close', handleClose);

    return () => {
      emojiPickerBus.off('open', handleOpen);
      emojiPickerBus.off('close', handleClose);
    };
  }, [handleOpen, handleClose]);

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
    <Drawer ref={drawerRef} position="bottom" className="h-[60vh] w-full rounded-t-2xl" onClose={handleClose}>
      <div className="p-4 pb-[env(safe-area-inset-bottom)] flex flex-col min-h-0">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-3">
          <h3 className="font-semibold text-lg">{t('pickers.emojiPicker.title')}</h3>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2" onClick={handleClose}>
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
