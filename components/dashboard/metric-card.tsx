/**
 * Reusable metric card component for dashboard KPIs
 *
 * Displays financial metrics with:
 * - Title and value
 * - Trend indicator with colored arrows
 * - Optional icon
 * - Professional styling for board presentations
 */

import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TrendDirection } from '@/lib/types';

interface MetricCardProps {
  /** Display title for the metric */
  title: string;

  /** Formatted value to display (e.g., "KES 1,234,567" or "4.5%") */
  value: string;

  /** Trend direction for the metric */
  trend: TrendDirection;

  /** Optional icon component to display */
  icon?: LucideIcon;

  /** Optional additional description or context */
  description?: string;

  /** Optional className for custom styling */
  className?: string;
}

/**
 * Get trend configuration based on direction
 *
 * @param trend - Trend direction (up/down/flat)
 * @returns Configuration object with icon, color, and label
 */
function getTrendConfig(trend: TrendDirection): {
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  label: string;
} {
  switch (trend) {
    case 'up':
      return {
        icon: ArrowUp,
        colorClass: 'text-green-700',
        bgClass: 'bg-green-100',
        label: 'Trending up',
      };
    case 'down':
      return {
        icon: ArrowDown,
        colorClass: 'text-red-700',
        bgClass: 'bg-red-100',
        label: 'Trending down',
      };
    case 'flat':
      return {
        icon: Minus,
        colorClass: 'text-slate-600',
        bgClass: 'bg-slate-100',
        label: 'Stable',
      };
  }
}

/**
 * MetricCard component
 * Displays a single KPI metric with trend indicator
 *
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Outstanding"
 *   value="KES 1,234,567"
 *   trend="up"
 *   icon={DollarSign}
 *   description="Active claims financed"
 * />
 * ```
 */
export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  description,
  className,
}: MetricCardProps) {
  const trendConfig = getTrendConfig(trend);
  const TrendIcon = trendConfig.icon;

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">
            {title}
          </CardTitle>
          {Icon && (
            <div className="rounded-lg bg-blue-100 p-2">
              <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {/* Main Value */}
          <div className="text-2xl font-bold text-slate-900">
            {value}
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                trendConfig.bgClass,
                trendConfig.colorClass
              )}
            >
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">{trendConfig.label}</span>
              <span>{trendConfig.label}</span>
            </div>
          </div>

          {/* Optional Description */}
          {description && (
            <p className="text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
