import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type Variant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

const variantStyles: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
