import { useContext, useState } from 'react';

import { EmojiPickerContext } from '@/context/EmojiPickerContext';

export function useEmojiPickerContext() {
  const ctx = useContext(EmojiPickerContext);
  if (!ctx) {
    throw new Error('useEmojiPickerContext must be used within an EmojiPickerProvider');
  }

  const [emoji, setEmoji] = useState<string | undefined>();

  const open = () => {
    ctx.open((picked) => {
      if (picked !== undefined) {
        setEmoji(picked.emoji);
      }
    });
  };

  return { emoji, setEmoji, open, close: ctx.close };
}
