import { forwardRef, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';

interface DrawerRef {
  openDrawer: () => void;
  close: () => void;
}

interface DrawerProps {
  className?: string;
  classNames?: {
    drawer?: string;
    overlay?: string;
  };
  position?: 'left' | 'right' | 'top' | 'bottom';
  children?: React.ReactNode;
  onClose?: () => void;
}

const Drawer = forwardRef<DrawerRef, DrawerProps>(
  ({ className = '', classNames, position = 'left', children, onClose }, ref) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      openDrawer: () => setOpen(true),
      close: () => setOpen(false),
    }));

    const handleClose = () => {
      setOpen(false);
      onClose?.();
    };

    const positionClasses: Record<string, string> = {
      left: `top-0 left-0 h-full ${open ? 'translate-x-0' : '-translate-x-full'} `,
      right: `top-0 right-0 h-full ${open ? 'translate-x-0' : 'translate-x-full'} `,
      top: `top-0 left-0 right-0 ${open ? 'translate-y-0' : '-translate-y-full'} `,
      bottom: `bottom-0 left-0 right-0 ${open ? 'translate-y-0' : 'translate-y-full'} pb-[env(safe-area-inset-bottom)]`,
    };

    const drawerContent = (
      <>
        {/* Overlay */}
        <div
          className={`
            fixed inset-0 bg-black/40 transition-opacity duration-200 cursor-pointer
            ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            ${classNames?.overlay ?? ''}
          `}
          style={{ zIndex: 999 }}
          onClick={handleClose}
        />

        {/* Drawer */}
        <div
          className={`
            fixed bg-base-100 shadow-xl p-2 transition-all duration-300
            ${positionClasses[position]}
            flex flex-col min-h-0
            ${className}
            ${classNames?.drawer ?? ''}
          `}
          style={{ zIndex: 999 }}
        >
          {children}
        </div>
      </>
    );

    return createPortal(drawerContent, document.body);
  },
);

export type { DrawerProps, DrawerRef };
export default Drawer;
