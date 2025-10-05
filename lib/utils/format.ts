/**
 * Formatting utilities for currency, percentages, and dates
 */

import { format } from 'date-fns';
import type { Cents } from '../types';
import { CURRENCY, centsToKes } from '../constants';

/**
 * Format cents as currency string
 *
 * @param cents - Amount in cents
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @returns Formatted currency string
 *
 * @example
 * formatCents(1000000) // "KES 10,000.00"
 * formatCents(1234567) // "KES 12,345.67"
 */
export function formatCents(cents: Cents, showSymbol: boolean = true): string {
  const kes = centsToKes(cents);

  const formatted = new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(kes);

  return showSymbol ? `${CURRENCY.SYMBOL} ${formatted}` : formatted;
}

/**
 * Format cents as compact currency (K, M notation)
 *
 * @param cents - Amount in cents
 * @returns Compact currency string
 *
 * @example
 * formatCentsCompact(1000000) // "KES 10K"
 * formatCentsCompact(100000000) // "KES 1M"
 */
export function formatCentsCompact(cents: Cents): string {
  const kes = centsToKes(cents);

  if (kes >= 1000000) {
    return `${CURRENCY.SYMBOL} ${(kes / 1000000).toFixed(1)}M`;
  }
  if (kes >= 1000) {
    return `${CURRENCY.SYMBOL} ${(kes / 1000).toFixed(1)}K`;
  }
  return formatCents(cents);
}

/**
 * Format decimal as percentage
 *
 * @param value - Decimal value (e.g., 0.045 for 4.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.045) // "4.50%"
 * formatPercentage(0.03, 1) // "3.0%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date as readable string
 *
 * @param date - Date object
 * @param formatStr - date-fns format string (default: "MMM dd, yyyy")
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date('2025-01-15')) // "Jan 15, 2025"
 */
export function formatDate(date: Date, formatStr: string = 'MMM dd, yyyy'): string {
  return format(date, formatStr);
}

/**
 * Format date as short string (for tables)
 *
 * @param date - Date object
 * @returns Short formatted date string
 *
 * @example
 * formatDateShort(new Date('2025-01-15')) // "15 Jan"
 */
export function formatDateShort(date: Date): string {
  return format(date, 'dd MMM');
}

/**
 * Format number with thousand separators
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.567, 2) // "1,234.57"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format days as duration text
 *
 * @param days - Number of days
 * @returns Human-readable duration
 *
 * @example
 * formatDays(45) // "45 days"
 * formatDays(1) // "1 day"
 */
export function formatDays(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}
