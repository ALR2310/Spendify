import { ReactNode } from 'react';

import { confirmBus } from './confirmBus';

export function confirm(message: ReactNode | string, title?: ReactNode | string): Promise<boolean> {
  return new Promise((resolve) => {
    confirmBus.emit('open', { message, title, resolve });
  });
}
