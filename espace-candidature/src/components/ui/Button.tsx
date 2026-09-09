import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'emerald' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 shadow-sm',
  };

  const variantStyles = {
    primary:
      'bg-terracotta-500 hover:bg-terracotta-600 text-white focus:ring-terracotta-400 shadow-md shadow-terracotta-900/15 active:scale-[0.98]',
    secondary:
      'bg-sand-200 hover:bg-sand-300 text-ink-900 border border-sand-300 focus:ring-sand-400 active:scale-[0.98]',
    outline:
      'border border-sand-400 bg-white hover:bg-sand-50 text-indigo-900 focus:ring-gold-400 active:scale-[0.98]',
    emerald:
      'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400 shadow-md shadow-emerald-900/15 active:scale-[0.98]',
    gold:
      'bg-gold-500 hover:bg-gold-600 text-white focus:ring-gold-400 shadow-md shadow-gold-900/15 active:scale-[0.98]',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white focus:ring-rose-500 shadow-sm active:scale-[0.98]',
    ghost:
      'hover:bg-sand-200/70 text-ink-800 hover:text-indigo-950 focus:ring-sand-300',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
