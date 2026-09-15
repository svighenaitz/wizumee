'use client';
import { useEffect, useRef } from 'react';
export default function ConfirmDialog({
  kind,
  cancel,
  confirm,
}: {
  kind: 'empty' | 'demo';
  cancel: () => void;
  confirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={ref} className="modal" aria-labelledby="confirm-title" onCancel={cancel}>
      <h2 id="confirm-title">
        {kind === 'empty' ? 'Iniziare un nuovo curriculum?' : 'Caricare il curriculum di esempio?'}
      </h2>
      <p>La bozza attuale verrà sostituita. Potrai annullare subito dopo.</p>
      <div>
        <button autoFocus className="button button-light" onClick={cancel}>
          Annulla
        </button>
        <button className="button button-dark" onClick={confirm}>
          Continua
        </button>
      </div>
    </dialog>
  );
}
