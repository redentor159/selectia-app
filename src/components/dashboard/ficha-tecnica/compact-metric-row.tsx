import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CompactMetricRowProps {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  valueClassName?: string;
  labelClassName?: string;
}

export function CompactMetricRow({
  icon: Icon,
  label,
  value,
  tooltip,
  valueClassName,
  labelClassName
}: CompactMetricRowProps) {
  const content = (
    <div className="flex items-baseline justify-between py-1.5 border-b border-[var(--border-default)] last:border-0 group gap-4">
      <div className={cn("flex items-center gap-1.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0", labelClassName)}>
        {Icon && <Icon className="h-3 w-3 shrink-0" />}
        <span className="text-[11px] font-medium uppercase tracking-wider whitespace-nowrap">{label}</span>
      </div>
      <div className="text-right flex-1 flex justify-end min-w-0">
        <span className={valueClassName || "text-[13px] font-semibold text-[var(--text-primary)] break-all sm:break-normal text-right"}>{value}</span>
      </div>
    </div>
  );

  if (!tooltip) return content;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help w-full overflow-hidden">
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
