import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface SectionHeaderProps {
  number: number;
  title: string;
  description?: string;
  tooltip?: string;
}

export function SectionHeader({ number, title, description, tooltip }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
          {number}
        </span>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {description && <p className="text-sm text-muted-foreground ml-11">{description}</p>}
    </div>
  );
}
