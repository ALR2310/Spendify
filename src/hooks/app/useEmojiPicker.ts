import { useContext, useState } from 'react';

import { EmojiPickerContext } from '@/context/EmojiPickerContext';

export function useEmojiPickerContext() {
  const [value, setValue] = useState<string>();
  const { openPicker, closePicker } = useContext(EmojiPickerContext);

  const open = async () => {
    const result = await openPicker();

    if (result !== undefined) {
      setValue(result.emoji);
    }
  };

  return { emoji: value, open, close: closePicker };
}
