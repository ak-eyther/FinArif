"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import type { PeriodType, DateRange } from "@/lib/types";
import {
  getPeriodDates,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfQuarter,
  getEndOfQuarter,
  getStartOfYear,
  getEndOfYear,
  addDays,
} from "@/lib/utils/date-period";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PeriodSelectorProps {
  value: {
    periodType: PeriodType;
    dateRange: DateRange;
  };
  onChange: (selection: {
    periodType: PeriodType;
    dateRange: DateRange;
  }) => void;
}

type PresetType =
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "last-quarter"
  | "this-year"
  | "last-year";

// ============================================================================
// PERIOD SELECTOR COMPONENT
// ============================================================================

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { periodType, dateRange } = value;

  // Local state for custom date range
  const [customStartDate, setCustomStartDate] = React.useState<Date | undefined>(
    dateRange.startDate
  );
  const [customEndDate, setCustomEndDate] = React.useState<Date | undefined>(
    dateRange.endDate
  );

  // Local state for reference date (60-day/90-day)
  const [referenceDate, setReferenceDate] = React.useState<Date>(
    dateRange.startDate
  );

  // ============================================================================
  // PERIOD TYPE HANDLERS
  // ============================================================================

  const handlePeriodTypeChange = (newPeriodType: PeriodType) => {
    if (newPeriodType === "custom") {
      // For custom, initialize with current date range or default to current month
      const initialStart = customStartDate || getStartOfMonth(new Date());
      const initialEnd = customEndDate || getEndOfMonth(new Date());
      setCustomStartDate(initialStart);
      setCustomEndDate(initialEnd);
      onChange({
        periodType: newPeriodType,
        dateRange: {
          startDate: initialStart,
          endDate: initialEnd,
        },
      });
    } else if (newPeriodType === "60-day" || newPeriodType === "90-day") {
      // For 60/90-day, use current reference date or default to today
      const refDate = referenceDate || new Date();
      setReferenceDate(refDate);
      const calculatedRange = getPeriodDates(newPeriodType, refDate);
      onChange({
        periodType: newPeriodType,
        dateRange: calculatedRange,
      });
    } else {
      // For monthly/quarterly/yearly, use current date
      const calculatedRange = getPeriodDates(newPeriodType, new Date());
      onChange({
        periodType: newPeriodType,
        dateRange: calculatedRange,
      });
    }
  };

  // ============================================================================
  // PRESET HANDLERS
  // ============================================================================

  const handlePresetClick = (preset: PresetType) => {
    const now = new Date();
    let newRange: DateRange;

    switch (preset) {
      case "this-month":
        newRange = {
          startDate: getStartOfMonth(now),
          endDate: getEndOfMonth(now),
        };
        break;

      case "last-month": {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        newRange = {
          startDate: getStartOfMonth(lastMonth),
          endDate: getEndOfMonth(lastMonth),
        };
        break;
      }

      case "this-quarter":
        newRange = {
          startDate: getStartOfQuarter(now),
          endDate: getEndOfQuarter(now),
        };
        break;

      case "last-quarter": {
        const lastQuarter = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        newRange = {
          startDate: getStartOfQuarter(lastQuarter),
          endDate: getEndOfQuarter(lastQuarter),
        };
        break;
      }

      case "this-year":
        newRange = {
          startDate: getStartOfYear(now),
          endDate: getEndOfYear(now),
        };
        break;

      case "last-year": {
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        newRange = {
          startDate: getStartOfYear(lastYear),
          endDate: getEndOfYear(lastYear),
        };
        break;
      }

      default:
        return;
    }

    onChange({
      periodType,
      dateRange: newRange,
    });
  };

  // ============================================================================
  // CUSTOM DATE RANGE HANDLERS
  // ============================================================================

  const handleCustomStartDateChange = (date: Date | undefined) => {
    if (!date) return;

    setCustomStartDate(date);

    // If end date exists and is valid, update the range
    if (customEndDate && date <= customEndDate) {
      onChange({
        periodType: "custom",
        dateRange: {
          startDate: date,
          endDate: customEndDate,
        },
      });
    } else if (!customEndDate) {
      // If no end date, just update start date
      setCustomStartDate(date);
    }
  };

  const handleCustomEndDateChange = (date: Date | undefined) => {
    if (!date) return;

    setCustomEndDate(date);

    // If start date exists and is valid, update the range
    if (customStartDate && customStartDate <= date) {
      onChange({
        periodType: "custom",
        dateRange: {
          startDate: customStartDate,
          endDate: date,
        },
      });
    } else if (!customStartDate) {
      // If no start date, just update end date
      setCustomEndDate(date);
    }
  };

  // ============================================================================
  // REFERENCE DATE HANDLERS (60-DAY/90-DAY)
  // ============================================================================

  const handleReferenceDateChange = (date: Date | undefined) => {
    if (!date) return;

    setReferenceDate(date);

    const calculatedRange = getPeriodDates(periodType, date);
    onChange({
      periodType,
      dateRange: calculatedRange,
    });
  };

  // ============================================================================
  // RENDER PRESET BUTTONS
  // ============================================================================

  const renderPresets = () => {
    if (periodType === "monthly") {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick("this-month")}
          >
            This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick("last-month")}
          >
            Last Month
          </Button>
        </div>
      );
    }

    if (periodType === "quarterly") {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick("this-quarter")}
          >
            This Quarter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick("last-quarter")}
          >
            Last Quarter
          </Button>
        </div>
      );
    }

    if (periodType === "yearly") {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick("this-year")}
          >
            This Year
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick("last-year")}
          >
            Last Year
          </Button>
        </div>
      );
    }

    return null;
  };

  // ============================================================================
  // RENDER CUSTOM DATE PICKERS
  // ============================================================================

  const renderCustomDatePickers = () => {
    const hasValidationError =
      customStartDate && customEndDate && customStartDate > customEndDate;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Start Date Picker */}
          <div className="flex flex-col gap-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal",
                    !customStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate ? (
                    format(customStartDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={handleCustomStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date Picker */}
          <div className="flex flex-col gap-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal",
                    !customEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEndDate ? (
                    format(customEndDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={handleCustomEndDateChange}
                  initialFocus
                  disabled={(date) =>
                    customStartDate ? date < customStartDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Validation Error */}
        {hasValidationError && (
          <p className="text-sm text-destructive">
            End date must be after start date
          </p>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER REFERENCE DATE PICKER (60-DAY/90-DAY)
  // ============================================================================

  const renderReferenceDatePicker = () => {
    const days = periodType === "60-day" ? 60 : 90;
    const endDate = addDays(referenceDate, days);

    return (
      <div className="flex flex-col gap-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[200px] justify-start text-left font-normal"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(referenceDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={referenceDate}
              onSelect={handleReferenceDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-sm text-muted-foreground">
          {days} days from {format(referenceDate, "MMM d, yyyy")} to{" "}
          {format(endDate, "MMM d, yyyy")}
        </p>
      </div>
    );
  };

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Period Type Selection Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Period Type Dropdown */}
        <div className="flex flex-col gap-2">
          <Label>Period Type</Label>
          <Select value={periodType} onValueChange={handlePeriodTypeChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="60-day">60-Day</SelectItem>
              <SelectItem value="90-day">90-Day</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Presets (for Monthly/Quarterly/Yearly) */}
        {(periodType === "monthly" ||
          periodType === "quarterly" ||
          periodType === "yearly") && (
          <div className="flex flex-col gap-2">
            <Label className="hidden sm:block opacity-0">Presets</Label>
            {renderPresets()}
          </div>
        )}
      </div>

      {/* Custom Date Range Section */}
      {periodType === "custom" && (
        <div className="border-t pt-4">{renderCustomDatePickers()}</div>
      )}

      {/* Reference Date Section (60-day/90-day) */}
      {(periodType === "60-day" || periodType === "90-day") && (
        <div className="border-t pt-4">{renderReferenceDatePicker()}</div>
      )}
    </div>
  );
}
