import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'soft' | 'light' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group/btn relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-semibold ' +
  'transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[var(--ease-out-quint)] ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55';

const variants: Record<Variant, string> = {
  // The one colour that asks you to act. A darker fill pours up from the bottom on hover.
  primary:
    'bg-tomato-500 text-white shadow-[0_10px_24px_-12px_rgb(217_71_43/0.9)] hover:shadow-[0_16px_32px_-14px_rgb(217_71_43/0.95)] ' +
    'before:absolute before:inset-0 before:-z-10 before:translate-y-full before:rounded-[inherit] before:bg-tomato-700 before:transition-transform before:duration-500 before:ease-[var(--ease-out-quint)] hover:before:translate-y-0',
  dark:
    'bg-herb-900 text-paper hover:bg-herb-800 ' +
    'before:absolute before:inset-0 before:-z-10 before:translate-y-full before:rounded-[inherit] before:bg-herb-700 before:transition-transform before:duration-500 before:ease-[var(--ease-out-quint)] hover:before:translate-y-0',
  outline: 'border border-line-2 bg-card text-ink hover:border-ink hover:bg-white',
  ghost: 'text-ink-2 hover:bg-ink/5 hover:text-ink',
  soft: 'bg-herb-50 text-herb-700 hover:bg-herb-100',
  light: 'bg-paper text-ink hover:bg-white',
  danger: 'border border-tomato-200 bg-tomato-50 text-tomato-700 hover:border-tomato-400 hover:bg-tomato-100',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 rounded-full px-4 text-[13px]',
  md: 'h-11 rounded-full px-5 text-sm',
  lg: 'h-14 rounded-full px-7 text-[15px]',
};

type Common = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  /** Trailing icon that nudges forward on hover (e.g. an arrow). */
  trail?: ReactNode;
  block?: boolean;
  className?: string;
  children?: ReactNode;
};

export type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type LinkButtonProps = Common & { to: string; state?: unknown; replace?: boolean; onClick?: () => void; 'aria-label'?: string };
type AnchorButtonProps = Common & { href: string; target?: string; rel?: string; download?: string | boolean };

function Inner({ loading, icon, trail, children }: Common) {
  return (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children && <span className="relative">{children}</span>}
      {trail && !loading && <span className="transition-transform duration-300 group-hover/btn:translate-x-1">{trail}</span>}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'dark', size = 'md', loading, icon, trail, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], block && 'w-full', className)}
      {...rest}
    >
      <Inner loading={loading} icon={icon} trail={trail}>
        {children}
      </Inner>
    </button>
  );
});

export function LinkButton({ variant = 'dark', size = 'md', icon, trail, block, className, children, to, state, replace, onClick, ...rest }: LinkButtonProps) {
  return (
    <Link to={to} state={state} replace={replace} onClick={onClick} className={cn(base, variants[variant], sizes[size], block && 'w-full', className)} {...rest}>
      <Inner icon={icon} trail={trail}>
        {children}
      </Inner>
    </Link>
  );
}

export function AnchorButton({ variant = 'dark', size = 'md', icon, trail, block, className, children, ...rest }: AnchorButtonProps) {
  return (
    <a className={cn(base, variants[variant], sizes[size], block && 'w-full', className)} {...rest}>
      <Inner icon={icon} trail={trail}>
        {children}
      </Inner>
    </a>
  );
}

/** Round icon-only button with an accessible label. */
export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'plain' | 'solid' | 'glass' }>(
  function IconButton({ label, tone = 'plain', className, children, type = 'button', ...rest }, ref) {
    const tones = {
      plain: 'text-ink-2 hover:bg-ink/6 hover:text-ink',
      solid: 'border border-line bg-card text-ink shadow-[var(--shadow-card)] hover:border-line-2',
      glass: 'bg-white/85 text-ink backdrop-blur hover:bg-white',
    };
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn('relative inline-grid size-10 shrink-0 place-items-center rounded-full transition active:scale-95 disabled:opacity-50', tones[tone], className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
