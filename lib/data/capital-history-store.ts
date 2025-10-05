/**
 * Capital Source History Tracking System
 * Phase 1 - Wave 2: Time-Based WACC Capital Management
 *
 * In-memory store for managing capital source history (MVP implementation)
 *
 * CRITICAL BUSINESS RULES:
 * - effectiveDate cannot be in the future
 * - sourceId must be unique for new sources
 * - For updates, sourceId must exist in history
 * - All history is immutable (never update existing entries)
 * - Each change creates a new history entry
 */

import type { CapitalSourceHistory, CapitalSource, Cents } from '@/lib/types';
import { CAPITAL_SOURCES } from '@/lib/constants';

/**
 * In-memory store for capital source history
 * All changes are tracked here for audit trail and historical analysis
 */
let capitalHistoryStore: CapitalSourceHistory[] = [];

/**
 * Counter for generating unique IDs
 * In production, replace with proper UUID generation
 */
let historyIdCounter = 1;

/**
 * Generates a unique history record ID
 */
function generateHistoryId(): string {
  return `hist_${Date.now()}_${historyIdCounter++}`;
}

/**
 * Generates a unique source ID
 * Uses crypto.randomUUID() if available, falls back to timestamp-based ID
 */
function generateSourceId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `src_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validates that a date is not in the future
 * @throws Error if date is in the future
 */
function validateEffectiveDate(effectiveDate: Date): void {
  const now = new Date();
  if (effectiveDate > now) {
    throw new Error('effectiveDate cannot be in the future');
  }
}

/**
 * Gets the current state of a capital source by reconstructing from history
 * Returns the most recent state before or at the given date
 */
function getCurrentSourceState(sourceId: string, asOfDate: Date = new Date()): CapitalSource | null {
  // Get all history for this source up to the given date
  const allHistory = capitalHistoryStore
    .filter(h => h.sourceId === sourceId && h.effectiveDate <= asOfDate)
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      const timeDiff = b.effectiveDate.getTime() - a.effectiveDate.getTime();
      if (timeDiff !== 0) return timeDiff;

      // If same timestamp, REMOVED actions should come first (highest priority)
      if (a.action === 'REMOVED' && b.action !== 'REMOVED') return -1;
      if (b.action === 'REMOVED' && a.action !== 'REMOVED') return 1;

      // Otherwise maintain original order
      return 0;
    });

  // If no history found, source doesn't exist
  if (allHistory.length === 0) {
    return null;
  }

  // Check if the most recent action was REMOVED
  if (allHistory[0].action === 'REMOVED') {
    return null;
  }

  const latest = allHistory[0];

  // Reconstruct the current state
  // Note: usedCents and remainingCents would be calculated from actual transaction data
  // For now, we use availableCents as the full available amount
  return {
    name: latest.name,
    annualRate: latest.annualRate,
    availableCents: latest.availableCents,
    usedCents: 0 as Cents,
    remainingCents: latest.availableCents,
    priority: 1, // Priority would need to be tracked separately or in history
  };
}

/**
 * Initializes capital history with existing CAPITAL_SOURCES from constants
 * Creates 'ADDED' entries for each source with effectiveDate = 90 days ago
 * This provides demo data for the MVP
 */
export function initializeCapitalHistory(): void {
  // Calculate date 90 days ago for demo data
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Clear existing store
  capitalHistoryStore = [];

  // Create history entries for each capital source
  CAPITAL_SOURCES.forEach((source) => {
    const sourceId = generateSourceId();

    const historyEntry: CapitalSourceHistory = {
      id: generateHistoryId(),
      sourceId: sourceId,
      effectiveDate: ninetyDaysAgo,
      name: source.name,
      annualRate: source.annualRate,
      availableCents: source.availableCents,
      action: 'ADDED',
      notes: 'Initial capital source - imported from system configuration',
    };

    capitalHistoryStore.push(historyEntry);
  });
}

/**
 * Adds a new capital source to the system
 * Creates a history entry with action='ADDED'
 *
 * @param source - Capital source details (without priority, which is auto-assigned)
 * @param effectiveDate - When this source becomes active
 * @param notes - Optional explanation for adding this source
 * @returns The newly generated sourceId
 * @throws Error if effectiveDate is in the future or sourceId already exists
 */
export function addCapitalSource(
  source: Omit<CapitalSource, 'priority'>,
  effectiveDate: Date,
  notes?: string
): string {
  validateEffectiveDate(effectiveDate);

  const sourceId = generateSourceId();

  const historyEntry: CapitalSourceHistory = {
    id: generateHistoryId(),
    sourceId: sourceId,
    effectiveDate: effectiveDate,
    name: source.name,
    annualRate: source.annualRate,
    availableCents: source.availableCents,
    action: 'ADDED',
    notes: notes,
  };

  capitalHistoryStore.push(historyEntry);

  return sourceId;
}

/**
 * Updates the available amount for a capital source
 * Creates a new history entry with action='AMOUNT_CHANGED'
 *
 * @param sourceId - ID of the capital source to update
 * @param newAmount - New available amount in cents
 * @param effectiveDate - When this change becomes effective
 * @param notes - Optional explanation for the change
 * @throws Error if effectiveDate is in future or sourceId doesn't exist
 */
export function updateCapitalAmount(
  sourceId: string,
  newAmount: Cents,
  effectiveDate: Date,
  notes?: string
): void {
  validateEffectiveDate(effectiveDate);

  const currentState = getCurrentSourceState(sourceId, effectiveDate);

  if (!currentState) {
    throw new Error(`Capital source with ID ${sourceId} not found or has been removed`);
  }

  const historyEntry: CapitalSourceHistory = {
    id: generateHistoryId(),
    sourceId: sourceId,
    effectiveDate: effectiveDate,
    name: currentState.name,
    annualRate: currentState.annualRate,
    availableCents: newAmount,
    action: 'AMOUNT_CHANGED',
    previousAmount: currentState.availableCents,
    notes: notes,
  };

  capitalHistoryStore.push(historyEntry);
}

/**
 * Updates the annual interest rate for a capital source
 * Creates a new history entry with action='RATE_CHANGED'
 *
 * @param sourceId - ID of the capital source to update
 * @param newRate - New annual rate as decimal (e.g., 0.14 for 14%)
 * @param effectiveDate - When this change becomes effective
 * @param notes - Optional explanation for the change
 * @throws Error if effectiveDate is in future or sourceId doesn't exist
 */
export function updateCapitalRate(
  sourceId: string,
  newRate: number,
  effectiveDate: Date,
  notes?: string
): void {
  validateEffectiveDate(effectiveDate);

  const currentState = getCurrentSourceState(sourceId, effectiveDate);

  if (!currentState) {
    throw new Error(`Capital source with ID ${sourceId} not found or has been removed`);
  }

  const historyEntry: CapitalSourceHistory = {
    id: generateHistoryId(),
    sourceId: sourceId,
    effectiveDate: effectiveDate,
    name: currentState.name,
    annualRate: newRate,
    availableCents: currentState.availableCents,
    action: 'RATE_CHANGED',
    previousRate: currentState.annualRate,
    notes: notes,
  };

  capitalHistoryStore.push(historyEntry);
}

/**
 * Removes a capital source from the system
 * Creates a history entry with action='REMOVED'
 * The source remains in history for audit purposes but won't be used for new transactions
 *
 * @param sourceId - ID of the capital source to remove
 * @param effectiveDate - When this removal becomes effective
 * @param notes - Optional explanation for the removal
 * @throws Error if effectiveDate is in future or sourceId doesn't exist
 */
export function removeCapitalSource(
  sourceId: string,
  effectiveDate: Date,
  notes?: string
): void {
  validateEffectiveDate(effectiveDate);

  const currentState = getCurrentSourceState(sourceId, effectiveDate);

  if (!currentState) {
    throw new Error(`Capital source with ID ${sourceId} not found or has already been removed`);
  }

  const historyEntry: CapitalSourceHistory = {
    id: generateHistoryId(),
    sourceId: sourceId,
    effectiveDate: effectiveDate,
    name: currentState.name,
    annualRate: currentState.annualRate,
    availableCents: currentState.availableCents,
    action: 'REMOVED',
    notes: notes,
  };

  capitalHistoryStore.push(historyEntry);
}

/**
 * Returns all capital source history entries
 * Sorted by effectiveDate in ascending order (oldest first)
 *
 * @returns Read-only copy of all history entries
 */
export function getCapitalHistory(): CapitalSourceHistory[] {
  // Return a deep copy to prevent external modifications
  return capitalHistoryStore
    .slice()
    .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());
}

/**
 * Returns all history entries for a specific capital source
 * Sorted by effectiveDate in ascending order (oldest first)
 *
 * @param sourceId - ID of the capital source
 * @returns Array of history entries for the specified source
 */
export function getHistoryForSource(sourceId: string): CapitalSourceHistory[] {
  return capitalHistoryStore
    .filter(h => h.sourceId === sourceId)
    .slice()
    .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());
}

/**
 * Returns history entries within a specific date range
 * Includes entries where effectiveDate falls between startDate and endDate (inclusive)
 * Sorted by effectiveDate in ascending order (oldest first)
 *
 * @param startDate - Start of the date range
 * @param endDate - End of the date range
 * @returns Array of history entries within the specified date range
 */
export function getHistoryInDateRange(
  startDate: Date,
  endDate: Date
): CapitalSourceHistory[] {
  return capitalHistoryStore
    .filter(h => h.effectiveDate >= startDate && h.effectiveDate <= endDate)
    .slice()
    .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());
}

/**
 * Helper function: Gets all unique source IDs in the system
 * Useful for iterating over all capital sources
 *
 * @returns Array of unique source IDs
 */
export function getAllSourceIds(): string[] {
  const sourceIds = new Set<string>();
  capitalHistoryStore.forEach(h => sourceIds.add(h.sourceId));
  return Array.from(sourceIds);
}

/**
 * Helper function: Gets the current active capital sources
 * Returns sources that have been added but not removed
 *
 * @param asOfDate - Date to check active sources (defaults to now)
 * @returns Array of currently active capital sources
 */
export function getActiveCapitalSources(asOfDate: Date = new Date()): CapitalSource[] {
  const sourceIds = getAllSourceIds();
  const activeSources: CapitalSource[] = [];

  for (const sourceId of sourceIds) {
    const state = getCurrentSourceState(sourceId, asOfDate);
    if (state) {
      activeSources.push(state);
    }
  }

  return activeSources;
}

// Initialize the store when the module loads
initializeCapitalHistory();
