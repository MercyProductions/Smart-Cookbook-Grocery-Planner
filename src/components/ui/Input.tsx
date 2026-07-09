import type { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 rounded-lg border border-border bg-card px-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none ${className}`}
      {...rest}
    />
  );
}
