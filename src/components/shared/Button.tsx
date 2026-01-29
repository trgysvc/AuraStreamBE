import { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
        secondary: 'bg-secondary text-white hover:bg-opacity-90 focus:ring-secondary',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
        danger: 'bg-status-error text-white hover:bg-red-600 focus:ring-red-500',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
}
