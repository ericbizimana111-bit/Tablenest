import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/format';

type FieldShell = { label?: ReactNode; hint?: ReactNode; error?: string; className?: string; optional?: boolean };

function Shell({ id, label, hint, error, className, optional, children }: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-semibold text-ink-2">
          <span>{label}</span>
          {optional && <span className="text-[11px] font-medium text-ink-4">Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-[12.5px] font-medium text-tomato-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12.5px] text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = FieldShell & InputHTMLAttributes<HTMLInputElement> & { leading?: ReactNode; trailing?: ReactNode };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, optional, leading, trailing, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Shell id={fid} label={label} hint={hint} error={error} className={className} optional={optional}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-4">{leading}</span>}
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={cn('input-base', !!leading && 'pl-11', !!trailing && 'pr-12', error && 'border-tomato-400 focus:border-tomato-500 focus:ring-tomato-500/10')}
          {...rest}
        />
        {trailing && <span className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</span>}
      </div>
    </Shell>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'trailing'>>(function PasswordInput(props, ref) {
  const [shown, setShown] = useState(false);
  return (
    <Input
      ref={ref}
      type={shown ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-ink/5 hover:text-ink"
          aria-label={shown ? 'Hide password' : 'Show password'}
        >
          {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { label, hint, error, className, optional, id, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Shell id={fid} label={label} hint={hint} error={error} className={className} optional={optional}>
      <textarea
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        className={cn('input-base min-h-28 resize-y py-3 leading-relaxed', error && 'border-tomato-400')}
        {...rest}
      />
    </Shell>
  );
});

export const Select = forwardRef<HTMLSelectElement, FieldShell & SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { label, hint, error, className, optional, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id || auto;
  return (
    <Shell id={fid} label={label} hint={hint} error={error} className={className} optional={optional}>
      <div className="relative">
        <select ref={ref} id={fid} className={cn('input-base appearance-none pr-10', error && 'border-tomato-400')} {...rest}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-3" />
      </div>
    </Shell>
  );
});

/** A labelled switch. */
export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; description?: ReactNode; disabled?: boolean }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start justify-between gap-4', disabled && 'cursor-not-allowed opacity-60')}>
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-ink-3">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-line-2 transition peer-checked:bg-herb-600 peer-focus-visible:ring-4 peer-focus-visible:ring-herb-500/20" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-spring)] peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
