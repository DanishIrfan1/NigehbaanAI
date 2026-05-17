import { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        {
          'bg-green-500/10 text-green-400 border-green-500/20': variant === 'success',
          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20': variant === 'warning',
          'bg-red-500/10 text-red-400 border-red-500/20': variant === 'danger',
          'bg-blue-500/10 text-blue-400 border-blue-500/20': variant === 'info',
          'bg-white/10 text-white/80 border-white/10': variant === 'default',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
