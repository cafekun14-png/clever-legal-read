import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlanBadge({
  premium,
  className,
}: {
  premium: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        premium
          ? "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200"
          : "bg-secondary text-muted-foreground",
        className,
      )}
    >
      {premium ? <Crown className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      {premium ? "Premium" : "Gratuito"}
    </span>
  );
}
