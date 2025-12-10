import { useEffect, useRef, useState } from 'react';

import Modal, { ModalRef } from '@/components/Modal';

import { confirmBus, ConfirmEvents } from './confirmBus';

export function ConfirmContainer() {
  const modalRef = useRef<ModalRef>(null!);
  const [data, setData] = useState<ConfirmEvents['open'] | null>(null);
  const open = data !== null;

  useEffect(() => {
    confirmBus.on('open', (payload) => {
      setData(payload);
    });
  }, []);

  useEffect(() => {
    if (open) modalRef.current?.showModal();
    else modalRef.current?.close();
  }, [open]);

  const handleClose = (result: boolean) => {
    data?.resolve(result);
    setData(null);
  };

  return (
    <Modal
      ref={modalRef}
      title={data?.title}
      className="z-1000"
      buttonSubmit={{ onClick: () => handleClose(true) }}
      buttonCancel={{ onClick: () => handleClose(false) }}
      backdropClose={false}
      iconClose={false}
    >
      {data?.message}
    </Modal>
  );
}
