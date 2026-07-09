import type { HTMLAttributes, ReactNode } from 'react';

type Variant = 'soft' | 'outline' | 'muted';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  soft: 'bg-primary-soft text-primary',
  outline: 'border border-border text-text-muted',
  muted: 'bg-surface text-text-muted',
};

export function Badge({ children, variant = 'soft', className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
