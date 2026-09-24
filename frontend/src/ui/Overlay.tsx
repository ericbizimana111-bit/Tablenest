import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/format';
import { IconButton } from './Button';

function useLockAndEscape(open: boolean, onClose: () => void, panel: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => {
      const target = panel.current?.querySelector<HTMLElement>('[data-autofocus]') || panel.current;
      target?.focus();
    }, 30);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, panel]);
}

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

/** Centred dialog on desktop; slides up as a sheet on phones. */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', className }: OverlayProps) {
  const panel = useRef<HTMLDivElement>(null);
  useLockAndEscape(open, onClose, panel);
  const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-herb-950/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-card shadow-[var(--shadow-pop)] outline-none sm:rounded-[28px]',
              widths[size],
              className,
            )}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-2 sm:hidden" />
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-2 sm:px-7 sm:pt-7">
                <div>
                  {title && <h2 className="text-2xl leading-tight text-ink">{title}</h2>}
                  {description && <p className="mt-1.5 text-sm text-ink-3">{description}</p>}
                </div>
                <IconButton label="Close" onClick={onClose} className="-mt-1 -mr-2">
                  <X className="size-5" />
                </IconButton>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-7">{children}</div>
            {footer && <div className="border-t border-line bg-paper/60 px-6 py-4 sm:px-7">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Side drawer (right on desktop, bottom on phones) — cart, filters, mobile menu. */
export function Drawer({ open, onClose, title, children, footer, side = 'right', className }: Omit<OverlayProps, 'size'> & { side?: 'right' | 'left' }) {
  const panel = useRef<HTMLDivElement>(null);
  useLockAndEscape(open, onClose, panel);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div className="absolute inset-0 bg-herb-950/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={cn(
              'absolute top-0 flex h-full w-full max-w-[440px] flex-col bg-card shadow-[var(--shadow-pop)] outline-none',
              side === 'right' ? 'right-0' : 'left-0',
              className,
            )}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="font-display text-xl text-ink">{title}</div>
              <IconButton label="Close" onClick={onClose}>
                <X className="size-5" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-line bg-paper/70 p-5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Two-button confirmation for destructive or irreversible actions. */
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = 'Confirm',
  tone = 'danger',
  loading,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  body?: ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'dark';
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button className="h-11 rounded-full px-5 text-sm font-semibold text-ink-2 hover:bg-ink/5" onClick={onClose}>
            Keep it
          </button>
          <button
            data-autofocus
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'h-11 rounded-full px-5 text-sm font-semibold text-white transition disabled:opacity-60',
              tone === 'danger' ? 'bg-tomato-600 hover:bg-tomato-700' : 'bg-herb-900 hover:bg-herb-800',
            )}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      }
    >
      {body && <p className="text-[15px] leading-relaxed text-ink-2">{body}</p>}
      {children}
    </Modal>
  );
}
