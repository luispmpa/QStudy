import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-muted-foreground mb-4 text-5xl">{icon}</div>}
      <h3 className="font-semibold text-foreground text-lg">{title}</h3>
      {description && <p className="text-muted-foreground text-sm mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingGrid({ cols = 3 }: { cols?: number }) {
  return (
    <div className={cn('grid gap-4', `sm:grid-cols-2 lg:grid-cols-${cols}`)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-lg" />
      ))}
    </div>
  );
}

interface EntityCardProps {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onStudy?: () => void;
  badge?: ReactNode;
  extra?: ReactNode;
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, BookOpen } from 'lucide-react';

export function EntityCard({
  title,
  subtitle,
  onClick,
  onRename,
  onDelete,
  onStudy,
  badge,
  extra,
}: EntityCardProps) {
  return (
    <div
      className="group relative rounded-lg border bg-card p-5 shadow-card hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          {subtitle && <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>}
          {badge && <div className="mt-2">{badge}</div>}
          {extra && <div className="mt-2">{extra}</div>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {onClick && (
              <DropdownMenuItem onClick={onClick}>
                <BookOpen className="h-4 w-4 mr-2" />
                Abrir
              </DropdownMenuItem>
            )}
            {onStudy && (
              <DropdownMenuItem onClick={onStudy}>
                <BookOpen className="h-4 w-4 mr-2" />
                Estudar agora
              </DropdownMenuItem>
            )}
            {onRename && (
              <DropdownMenuItem onClick={onRename}>
                <Pencil className="h-4 w-4 mr-2" />
                Renomear
              </DropdownMenuItem>
            )}
            {(onClick || onRename) && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
