import { useContext, useState } from 'react';

import { EmojiPickerContext } from '@/context/EmojiPickerContext';

export function useEmojiPicker() {
  const [value, setValue] = useState<string>();
  const { openPicker, closePicker } = useContext(EmojiPickerContext);

  const open = async () => {
    const result = await openPicker();

    if (result !== undefined) {
      setValue(result.emoji);
    }
  };

  return [value, open, closePicker] as const;
}
