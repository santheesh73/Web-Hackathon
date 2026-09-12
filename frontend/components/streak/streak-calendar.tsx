'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, Check, Sparkles, Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStreak } from '@/features/streak/use-streak';

export interface StreakCalendarProps {
  days?: number;
  className?: string;
}

export function StreakCalendar({ days = 28, className }: StreakCalendarProps) {
  const { calendarDays, loading } = useStreak();

  if (loading) {
    return (
      <Card className={`p-6 border-border bg-surface ${className}`}>
        <div className="h-6 w-36 bg-slate-200 animate-pulse rounded mb-4" />
        <div className="h-16 w-full bg-slate-100 animate-pulse rounded-xl" />
      </Card>
    );
  }

  // Slice to requested days (e.g., 28 days = 4 full weeks)
  const displayDays = calendarDays.slice(-days);
  const activeCount = displayDays.filter((d) => d.active).length;

  return (
    <Card className={`p-6 border-border bg-surface ${className}`}>
      <CardHeader className="p-0 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Consistency Calendar</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Daily qualifying quest completions over the past {days} days.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="rpg" size="sm" className="gap-1">
              <Flame className="h-3 w-3 text-amber-500" />
              {activeCount} / {displayDays.length} Days Active
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2">
        {/* Responsive Grid: 7 columns (Mon-Sun or weeks) */}
        <div className="space-y-2">
          {/* Day initials row (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] font-semibold text-muted-foreground uppercase">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>

          {/* Activity blocks */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {displayDays.map((day) => {
              const dateObj = new Date(day.date + 'T00:00:00Z');
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
              });

              return (
                <div
                  key={day.date}
                  title={`${formattedDate}: ${
                    day.active
                      ? `${day.count} quest${day.count > 1 ? 's' : ''} completed`
                      : 'No activity'
                  }${day.isRecovery ? ' (Recovered)' : ''}${day.isToday ? ' - Today' : ''}`}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-medium transition-all select-none group cursor-pointer ${
                    day.active
                      ? day.isRecovery
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 hover:border-slate-300'
                  } ${day.isToday ? 'ring-2 ring-primary ring-offset-1 font-bold' : ''}`}
                >
                  {/* Visual non-color indicator */}
                  {day.active ? (
                    day.isRecovery ? (
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                    )
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {dateObj.getUTCDate()}
                    </span>
                  )}

                  {/* Today marker badge */}
                  {day.isToday && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary ring-1 ring-white" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 mt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-gradient-to-br from-emerald-500 to-emerald-600 inline-block" />
              <span>Conquered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
              <span>Recovered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-slate-100 border border-slate-200 inline-block" />
              <span>Missed</span>
            </div>
          </div>

          <span className="font-medium text-foreground">
            {Math.round((activeCount / displayDays.length) * 100)}% Consistency
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
