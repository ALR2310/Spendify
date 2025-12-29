import { useCallback, useEffect, useState } from 'react';

import { EmojiItem, emojiPickerBus, EmojiPickerEvents } from './emojiPickerBus';

let pickerIdCounter = 0;

export function useEmojiPicker(initial?: EmojiItem) {
  const [emoji, setEmoji] = useState<EmojiItem | undefined>(initial);
  const [pickerId] = useState(() => `emoji-picker-${++pickerIdCounter}`);

  const open = useCallback(() => {
    emojiPickerBus.emit('open', { pickerId });
  }, [pickerId]);

  const close = useCallback(() => {
    emojiPickerBus.emit('close');
  }, []);

  useEffect(() => {
    const handleEmojiSelect = (data: EmojiPickerEvents['select']) => {
      if (data.pickerId === pickerId) {
        setEmoji(data.emoji);
      }
    };

    emojiPickerBus.on('select', handleEmojiSelect);
    return () => {
      emojiPickerBus.off('select', handleEmojiSelect);
    };
  }, [pickerId]);

  return {
    emoji,
    setEmoji,
    open,
    close,
  };
}

export type { EmojiItem };
