import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  icon: Icon = null,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-xs hover:shadow-md hover:-translate-y-0.5',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
    outline: 'border border-outline-variant bg-white text-on-surface hover:bg-surface-container-low shadow-2xs',
    danger: 'bg-error text-white hover:bg-error/90 shadow-xs',
    ghost: 'text-on-surface-variant hover:bg-surface-container-low'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
