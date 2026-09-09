import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'terracotta' | 'emerald' | 'gold';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-sand-200 text-ink-900 border-sand-300',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    warning: 'bg-gold-50 text-gold-900 border-gold-300',
    error: 'bg-terracotta-50 text-terracotta-800 border-terracotta-300',
    info: 'bg-fes-50 text-fes-800 border-fes-200',
    purple: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    terracotta: 'bg-terracotta-500 text-white border-terracotta-600',
    emerald: 'bg-emerald-600 text-white border-emerald-700',
    gold: 'bg-gold-500 text-white border-gold-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
