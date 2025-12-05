import { forwardRef, ReactNode, useImperativeHandle, useState } from 'react';

interface ButtonProps {
  label?: string;
  show?: boolean;
  className?: string;
  onClick?: () => void | Promise<void>;
}

interface ModalProps {
  title?: ReactNode;
  className?: string;
  modalClassName?: string;
  buttonSubmit?: ButtonProps;
  buttonCancel?: ButtonProps;
  backdropClose?: boolean;
  iconClose?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

interface ModalRef {
  showModal: () => void;
  close: () => void;
}

const Modal = forwardRef<ModalRef, ModalProps>(
  (
    {
      title,
      className = '',
      modalClassName = '',
      buttonSubmit = { show: true },
      buttonCancel = { show: true },
      backdropClose = true,
      iconClose = true,
      onClose,
      children,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    const handleClose = () => {
      setOpen(false);
      if (onClose) {
        onClose();
      }
    };

    useImperativeHandle(ref, () => ({
      showModal: () => setOpen(true),
      close: () => handleClose(),
    }));

    return (
      <div className={`modal ${open ? 'modal-open' : ''} outline-none ${modalClassName || ''}`}>
        <div className={`modal-box outline-none ${className}`}>
          {iconClose && (
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={handleClose}>
              ✕
            </button>
          )}

          {title && <div className="text-lg font-bold mb-4">{title}</div>}
          {children}

          {(buttonSubmit?.show || buttonCancel?.show) && (
            <div className="modal-action">
              {buttonCancel?.show && (
                <button
                  className={`btn w-24 ${buttonCancel?.className || 'btn-soft'}`}
                  onClick={() => {
                    if (buttonCancel.onClick) buttonCancel.onClick();
                    else setOpen(false);
                  }}
                >
                  {buttonCancel?.label || 'Cancel'}
                </button>
              )}

              {buttonSubmit?.show && (
                <button
                  className={`btn w-24 ${buttonSubmit?.className || 'btn-success'}`}
                  onClick={() => {
                    if (buttonSubmit.onClick) buttonSubmit.onClick();
                    else setOpen(false);
                  }}
                >
                  {buttonSubmit?.label || 'OK'}
                </button>
              )}
            </div>
          )}
        </div>
        {backdropClose && <div className="modal-backdrop cursor-pointer" onClick={handleClose} />}
      </div>
    );
  },
);

export type { ModalRef };
export default Modal;
