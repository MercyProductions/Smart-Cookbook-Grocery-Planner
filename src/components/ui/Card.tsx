import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-sm ${
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
