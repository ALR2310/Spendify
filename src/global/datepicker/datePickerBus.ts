import mitt from 'mitt';

type DatePickerEvents = {
  select: { date?: Date; pickerId?: string };
  open: { initial?: Date; pickerId?: string };
  close: void;
};
export const datePickerBus = mitt<DatePickerEvents>();
export type { DatePickerEvents };
