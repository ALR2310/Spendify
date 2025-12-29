import mitt from 'mitt';

export interface EmojiItem {
  id: number;
  code: string;
  emoji: string;
  name: string;
  nameUrl: string;
  category: string;
}

type EmojiPickerEvents = {
  select: { emoji?: EmojiItem; pickerId?: string };
  open: { pickerId?: string };
  close: void;
};

export const emojiPickerBus = mitt<EmojiPickerEvents>();
export type { EmojiPickerEvents };
