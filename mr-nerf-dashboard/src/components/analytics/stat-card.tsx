"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change
  icon?: React.ReactNode;
  subtitle?: string;
}

export function StatCard({ title, value, change, icon, subtitle }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
          <div className="flex items-center mt-1 gap-1">
            {change !== undefined && (
              <>
                {isPositive && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                {isNegative && (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {!isPositive && !isNegative && (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive && "text-green-500",
                    isNegative && "text-red-500",
                    !isPositive && !isNegative && "text-muted-foreground"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </>
            )}
            {subtitle && (
              <span className="text-sm text-muted-foreground ml-1">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
