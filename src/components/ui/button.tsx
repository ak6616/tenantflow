import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const variantStyles: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-card hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-(--radius-sm)",
  md: "h-9 px-4 text-sm rounded-(--radius-md)",
  lg: "h-10 px-6 text-sm rounded-(--radius-md)",
  icon: "h-9 w-9 rounded-(--radius-md)",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
