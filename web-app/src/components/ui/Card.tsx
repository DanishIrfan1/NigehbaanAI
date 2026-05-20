import { HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'glass' | 'panel' | 'solid';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl p-6",
          variant === 'glass' && "glass-card",
          variant === 'panel' && "glass-panel",
          variant === 'solid' && "bg-surface border border-white/5",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
