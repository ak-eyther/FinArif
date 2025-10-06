/**
 * Example Usage of PeriodSelector Component
 *
 * This file demonstrates how to use the PeriodSelector component
 * in your application.
 */

"use client";

import * as React from "react";
import { PeriodSelector } from "./PeriodSelector";
import type { PeriodType, DateRange } from "@/lib/types";
import { formatPeriodLabel } from "@/lib/utils/date-period";

export function PeriodSelectorExample() {
  const [selection, setSelection] = React.useState<{
    periodType: PeriodType;
    dateRange: DateRange;
  }>({
    periodType: "monthly",
    dateRange: {
      startDate: new Date(2025, 0, 1), // Jan 1, 2025
      endDate: new Date(2025, 0, 31), // Jan 31, 2025
    },
  });

  const handleChange = (newSelection: {
    periodType: PeriodType;
    dateRange: DateRange;
  }) => {
    console.log("Period changed:", newSelection);
    setSelection(newSelection);
  };

  return (
    <div className="space-y-4 p-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Period Selector Example</h2>
        <p className="text-muted-foreground">
          Select a period type and date range to see how the component works.
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <PeriodSelector value={selection} onChange={handleChange} />
      </div>

      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Current Selection:</h3>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Period Type:</span>{" "}
            {selection.periodType}
          </p>
          <p>
            <span className="font-medium">Start Date:</span>{" "}
            {selection.dateRange.startDate.toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">End Date:</span>{" "}
            {selection.dateRange.endDate.toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Formatted Label:</span>{" "}
            {formatPeriodLabel(
              selection.periodType,
              selection.dateRange.startDate,
              selection.dateRange.endDate
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
