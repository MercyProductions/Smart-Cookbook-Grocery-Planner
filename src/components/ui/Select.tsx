import type { SelectHTMLAttributes } from 'react';

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-10 rounded-lg border border-border bg-card px-3 text-sm text-text focus:border-primary focus:outline-none ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
