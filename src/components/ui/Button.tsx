import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#102a1d] text-[#d4f54e] hover:bg-[#173f2d] hover:shadow-sm focus:ring-[#102a1d] border border-[#1c4530] font-semibold shadow-xs active:scale-[0.98]',
    secondary:
      'bg-[#ede8dc] text-[#19211c] hover:bg-[#ded7c7] border border-[#ded7c7] focus:ring-[#ded7c7] font-semibold active:scale-[0.98]',
    danger:
      'bg-[#991b1b] text-white hover:bg-[#7f1d1d] focus:ring-[#991b1b] shadow-xs active:scale-[0.98]',
    outline:
      'border border-[#ded7c7] bg-[#fdfbf7] text-[#19211c] hover:bg-[#ede8dc] focus:ring-[#ded7c7] font-semibold active:scale-[0.98]',
    ghost:
      'bg-transparent text-[#627267] hover:text-[#19211c] hover:bg-[#ede8dc]/50 focus:ring-[#ded7c7]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
