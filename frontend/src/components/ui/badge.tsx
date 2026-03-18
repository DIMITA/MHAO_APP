import * as React from 'react';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status' | 'outline';
  status?: string;
}

function Badge({ className, variant = 'default', status, children, ...props }: BadgeProps) {
  if (status) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          getStatusColor(status),
          className,
        )}
        {...props}
      >
        {children ?? getStatusLabel(status)}
      </span>
    );
  }

  const variants = {
    default: 'bg-primary-100 text-primary-800',
    status: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
