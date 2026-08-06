import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card shadow-[0_1px_2px_rgba(23,24,23,0.03)] ${
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-text/20 hover:shadow-[0_12px_28px_rgba(23,24,23,0.08)]' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
