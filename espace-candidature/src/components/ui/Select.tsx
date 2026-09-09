import React, { forwardRef } from 'react';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  className = '',
  id,
  required,
  placeholder,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-indigo-950">
          {label}
          {required && <span className="text-terracotta-600 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-subtle">
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-xl border text-sm transition-all py-2.5 px-3.5 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-500 appearance-none bg-no-repeat bg-[right_14px_center] cursor-pointer ${
            error
              ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-400 focus:border-rose-500'
              : 'border-sand-300 hover:border-sand-400 focus:bg-white'
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C9962E' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.8' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundSize: '1.25em 1.25em'
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${selectId}-helper`} className="text-xs text-sand-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
