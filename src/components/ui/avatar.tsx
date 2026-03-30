import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary",
        className
      )}
    >
      {initials}
    </div>
  );
}
