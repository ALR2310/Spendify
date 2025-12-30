import mitt from 'mitt';

type MonthPickerEvents = {
  select: { month?: Date; pickerId?: string };
  open: { initial?: Date; pickerId?: string };
  close: void;
};

export const monthPickerBus = mitt<MonthPickerEvents>();
export type { MonthPickerEvents };
