import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
