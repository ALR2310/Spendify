import { ReactNode } from 'react';

import { confirmBus } from './confirmBus';

type ConfirmOptions = {
  message: ReactNode;
  title?: ReactNode;
};

export function confirm(options: ConfirmOptions): Promise<boolean>;
export function confirm(message: ReactNode, title?: ReactNode): Promise<boolean>;
export function confirm(arg1: ReactNode | ConfirmOptions, arg2?: ReactNode): Promise<boolean> {
  return new Promise((resolve) => {
    if (arg1 !== null && typeof arg1 === 'object' && 'message' in arg1) {
      confirmBus.emit('open', { message: arg1.message, title: arg1.title, resolve });
    } else {
      confirmBus.emit('open', { message: arg1, title: arg2, resolve });
    }
  });
}
