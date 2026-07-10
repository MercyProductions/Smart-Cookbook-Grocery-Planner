import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`h-10 rounded-lg border border-border bg-card px-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none ${className}`}
      {...rest}
    />
  );
});
