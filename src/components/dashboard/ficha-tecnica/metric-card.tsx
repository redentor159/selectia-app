import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tooltip,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | React.ReactNode;
  hint?: string | React.ReactNode;
  tooltip?: string;
}) {
  const content = (
    <div className="relative overflow-hidden rounded-lg p-3 h-full flex flex-col justify-center transition-all duration-300 hover:bg-[var(--bg-overlay)] group">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
        <span className="eyebrow">{label}</span>
      </div>
      <div className="text-base font-extrabold text-[var(--text-primary)] num tracking-tight">
        {value}
      </div>
      {hint && <div className="text-[11px] font-medium text-[var(--text-disabled)] mt-0.5 truncate">{hint}</div>}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help h-full">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs max-w-[200px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
