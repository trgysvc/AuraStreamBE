import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, helperText, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={twMerge(
                            'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error && 'border-status-error focus:border-status-error focus:ring-status-error',
                            props.disabled && 'bg-gray-100 cursor-not-allowed dark:bg-gray-900',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error ? (
                    <p className="mt-1 text-sm text-status-error">{error}</p>
                ) : helperText ? (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';
