import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: ReactNode;
    onClick?: () => void;
}

export function Card({ children, className, title, description, footer, onClick }: CardProps) {
    return (
        <div
            className={twMerge(
                'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
                onClick && 'cursor-pointer hover:shadow-md transition-shadow',
                className
            )}
            onClick={onClick}
        >
            {(title || description) && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
                    {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
                </div>
            )}
            <div className="px-6 py-4">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                    {footer}
                </div>
            )}
        </div>
    );
}
