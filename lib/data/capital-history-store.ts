/**
 * Capital Source History Tracking System
 * Phase 1 - Wave 2: Time-Based WACC Capital Management
 *
 * localStorage-backed store for managing capital source history (MVP+ implementation)
 *
 * CRITICAL BUSINESS RULES:
 * - effectiveDate cannot be in the future
 * - sourceId must be unique for new sources
 * - For updates, sourceId must exist in history
 * - All history is immutable (never update existing entries)
 * - Each change creates a new history entry
 *
 * PERSISTENCE:
 * Phase 1 (CURRENT): localStorage for single-user persistence across sessions
 * Phase 2 (TODO): PostgreSQL + API for multi-user production deployment
 * See: .claude/roadmap/CAPITAL_PERSISTENCE_PHASE2.md
 */

import type { CapitalSourceHistory, CapitalSource, Cents } from '@/lib/types';
import { CAPITAL_SOURCES } from '@/lib/constants';

/**
 * localStorage key for persisting capital history
 */
const STORAGE_KEY = 'finarif_capital_history_v1';

/**
 * In-memory store for capital source history
 * Synced with localStorage for persistence across page refreshes
 */
let capitalHistoryStore: CapitalSourceHistory[] = [];

/**
 * Counter for generating unique IDs
 * Synced with localStorage to prevent ID collisions
 */
let historyIdCounter = 1;

/**
 * Flag to track if store has been initialized from localStorage
 */
let isHydrated = false;

/**
 * Serializes a history entry for localStorage
 * Converts Date objects to ISO strings for JSON storage
 */
function serializeHistory(history: CapitalSourceHistory[]): string {
  return JSON.stringify(
    history.map((entry) => ({
      ...entry,
      effectiveDate: entry.effectiveDate.toISOString(),
    }))
  );
}

/**
 * Deserializes history from localStorage
 * Converts ISO strings back to Date objects
 */
function deserializeHistory(json: string): CapitalSourceHistory[] {
  try {
    const parsed = JSON.parse(json);
    return parsed.map((entry: CapitalSourceHistory & { effectiveDate: string }) => ({
      ...entry,
      effectiveDate: new Date(entry.effectiveDate),
    }));
  } catch (error) {
    console.error('Failed to deserialize capital history:', error);
    return [];
  }
}

/**
 * Saves current store to localStorage
 */
function persistToStorage(): void {
  if (typeof window === 'undefined') return; // Skip during SSR

  try {
    const serialized = serializeHistory(capitalHistoryStore);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(`${STORAGE_KEY}_counter`, String(historyIdCounter));
  } catch (error) {
    console.error('Failed to persist capital history to localStorage:', error);
  }
}

/**
 * Loads store from localStorage
 * Only runs once per session to prevent data loss
 */
function hydrateFromStorage(): void {
  if (typeof window === 'undefined') return; // Skip during SSR
  if (isHydrated) return; // Already hydrated, don't overwrite

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedCounter = localStorage.getItem(`${STORAGE_KEY}_counter`);

    if (stored) {
      capitalHistoryStore = deserializeHistory(stored);
      console.log(`✅ Hydrated ${capitalHistoryStore.length} capital history entries from localStorage`);
    }

    if (storedCounter) {
      historyIdCounter = parseInt(storedCounter, 10) || 1;
    }

    isHydrated = true;
  } catch (error) {
    console.error('Failed to hydrate capital history from localStorage:', error);
    isHydrated = true; // Mark as hydrated even on error to prevent infinite loops
  }
}

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
  const filteredHistory = capitalHistoryStore.filter(
    h => h.sourceId === sourceId && h.effectiveDate <= asOfDate
  );

  // If no history found, source doesn't exist
  if (filteredHistory.length === 0) {
    return null;
  }

  // Sort chronologically ascending (oldest first) by effectiveDate, then by id
  // This ensures later entries overwrite earlier ones when we pick the last one
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    // Sort by effectiveDate ascending (oldest first)
    const timeDiff = a.effectiveDate.getTime() - b.effectiveDate.getTime();
    if (timeDiff !== 0) return timeDiff;

    // For same-day entries, use id as tie-breaker (ascending)
    // IDs contain timestamps (format: hist_${Date.now()}_${counter})
    // Later entries have lexicographically larger IDs
    return a.id.localeCompare(b.id);
  });

  // Pick the LAST entry (most recent) from the sorted array
  const latest = sortedHistory[sortedHistory.length - 1];

  // Check if the most recent action was REMOVED
  // REMOVED takes precedence - if the latest action is REMOVED, source is gone
  if (latest.action === 'REMOVED') {
    return null;
  }

  // Reconstruct the current state from the latest non-REMOVED entry
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
 * Phase 1: Hydrates from localStorage first, only seeds demo data if empty
 * This provides demo data for the MVP while preserving user additions
 */
export function initializeCapitalHistory(): void {
  // First, try to load from localStorage
  hydrateFromStorage();

  // Only seed demo data if store is completely empty
  if (capitalHistoryStore.length === 0) {
    console.log('📦 No saved data found, seeding demo capital sources...');

    // Calculate date 90 days ago for demo data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

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

    // Persist the demo data to localStorage
    persistToStorage();
    console.log(`✅ Seeded ${capitalHistoryStore.length} demo capital sources`);
  }
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
  persistToStorage(); // Phase 1: Persist to localStorage

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
  persistToStorage(); // Phase 1: Persist to localStorage
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
  persistToStorage(); // Phase 1: Persist to localStorage
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
  persistToStorage(); // Phase 1: Persist to localStorage
}

/**
 * Deep clones a history entry to prevent external mutation
 * Creates new Date instance to ensure immutability
 */
function cloneHistoryEntry(entry: CapitalSourceHistory): CapitalSourceHistory {
  return {
    ...entry,
    effectiveDate: new Date(entry.effectiveDate), // Clone Date object
  };
}

/**
 * Returns all capital source history entries
 * Sorted by effectiveDate in ascending order (oldest first)
 *
 * @returns Deep-cloned array of all history entries (immutable)
 */
export function getCapitalHistory(): CapitalSourceHistory[] {
  // Deep clone entries before sorting to prevent external mutations
  return capitalHistoryStore
    .map(cloneHistoryEntry)
    .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());
}

/**
 * Returns all history entries for a specific capital source
 * Sorted by effectiveDate in ascending order (oldest first)
 *
 * @param sourceId - ID of the capital source
 * @returns Deep-cloned array of history entries for the specified source (immutable)
 */
export function getHistoryForSource(sourceId: string): CapitalSourceHistory[] {
  return capitalHistoryStore
    .filter(h => h.sourceId === sourceId)
    .map(cloneHistoryEntry)
    .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());
}

/**
 * Returns history entries within a specific date range
 * Includes entries where effectiveDate falls between startDate and endDate (inclusive)
 * Sorted by effectiveDate in ascending order (oldest first)
 *
 * @param startDate - Start of the date range
 * @param endDate - End of the date range
 * @returns Deep-cloned array of history entries within the specified date range (immutable)
 */
export function getHistoryInDateRange(
  startDate: Date,
  endDate: Date
): CapitalSourceHistory[] {
  return capitalHistoryStore
    .filter(h => h.effectiveDate >= startDate && h.effectiveDate <= endDate)
    .map(cloneHistoryEntry)
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
