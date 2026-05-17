import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface ProgressBarProps {
  progress: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ progress, className, color = "bg-accent" }: ProgressBarProps) {
  return (
    <div className={cn("h-2 w-full bg-white/10 rounded-full overflow-hidden", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  );
}
