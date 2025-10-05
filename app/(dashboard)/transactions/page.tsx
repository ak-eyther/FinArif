'use client';

/**
 * Transactions List Page
 *
 * Full table of all transactions with sorting, filtering, and navigation
 * Features:
 * - All 18 transactions displayed
 * - Client-side sorting by any column
 * - Filter by status (Active/Collected/Defaulted)
 * - Risk-based color coding
 * - Navigate to transaction details
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTransactions } from '@/lib/mock-data';
import { formatCents, formatDate } from '@/lib/utils/format';
import type { Transaction, TransactionStatus, RiskLevel } from '@/lib/types';

/**
 * Sort direction type
 */
type SortDirection = 'asc' | 'desc' | null;

/**
 * Sortable column keys
 */
type SortableColumn =
  | 'id'
  | 'providerName'
  | 'insuranceName'
  | 'claimAmountCents'
  | 'disbursementDate'
  | 'expectedCollectionDate'
  | 'status'
  | 'riskScore';

/**
 * Get badge variant based on transaction status
 */
function getStatusBadgeVariant(
  status: TransactionStatus
): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'collected':
      return 'secondary';
    case 'defaulted':
      return 'destructive';
  }
}

/**
 * Get risk badge styling based on risk level
 */
function getRiskBadgeStyles(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100';
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100';
  }
}

/**
 * Sort transactions by column
 */
function sortTransactions(
  transactions: Transaction[],
  column: SortableColumn,
  direction: SortDirection
): Transaction[] {
  if (!direction) return transactions;

  const sorted = [...transactions].sort((a, b) => {
    const aValue: string | number | Date = a[column];
    const bValue: string | number | Date = b[column];

    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return sorted;
}

/**
 * Transactions Page Component
 */
export default function TransactionsPage() {
  const allTransactions = getTransactions();

  // State for filtering and sorting
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>(
    'all'
  );
  const [sortColumn, setSortColumn] = useState<SortableColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  /**
   * Handle column header click for sorting
   */
  const handleSort = (column: SortableColumn): void => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  /**
   * Get sort indicator icon
   */
  const getSortIcon = (column: SortableColumn): string => {
    if (sortColumn !== column) return '↕';
    if (sortDirection === 'asc') return '↑';
    if (sortDirection === 'desc') return '↓';
    return '↕';
  };

  /**
   * Filter and sort transactions
   */
  const displayedTransactions = useMemo(() => {
    // Apply status filter
    let filtered =
      statusFilter === 'all'
        ? allTransactions
        : allTransactions.filter((tx) => tx.status === statusFilter);

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = sortTransactions(filtered, sortColumn, sortDirection);
    }

    return filtered;
  }, [allTransactions, statusFilter, sortColumn, sortDirection]);

  /**
   * Get transaction counts by status
   */
  const statusCounts = useMemo(() => {
    return {
      all: allTransactions.length,
      active: allTransactions.filter((tx) => tx.status === 'active').length,
      collected: allTransactions.filter((tx) => tx.status === 'collected')
        .length,
      defaulted: allTransactions.filter((tx) => tx.status === 'defaulted')
        .length,
    };
  }, [allTransactions]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor all claim financing transactions
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium mb-3">Filter by Status</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({statusCounts.all})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active ({statusCounts.active})
              </Button>
              <Button
                variant={statusFilter === 'collected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('collected')}
              >
                Collected ({statusCounts.collected})
              </Button>
              <Button
                variant={statusFilter === 'defaulted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('defaulted')}
              >
                Defaulted ({statusCounts.defaulted})
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {displayedTransactions.length} Transaction
              {displayedTransactions.length !== 1 ? 's' : ''}
            </h2>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleSort('id')}
                      className="font-medium hover:text-foreground flex items-center gap-1"
                    >
                      ID {getSortIcon('id')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('providerName')}
                      className="font-medium hover:text-foreground flex items-center gap-1"
                    >
                      Provider {getSortIcon('providerName')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('insuranceName')}
                      className="font-medium hover:text-foreground flex items-center gap-1"
                    >
                      Insurer {getSortIcon('insuranceName')}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button
                      onClick={() => handleSort('claimAmountCents')}
                      className="font-medium hover:text-foreground flex items-center gap-1 ml-auto"
                    >
                      Claim Amount {getSortIcon('claimAmountCents')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('disbursementDate')}
                      className="font-medium hover:text-foreground flex items-center gap-1"
                    >
                      Disbursement {getSortIcon('disbursementDate')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('expectedCollectionDate')}
                      className="font-medium hover:text-foreground flex items-center gap-1"
                    >
                      Expected Collection {getSortIcon('expectedCollectionDate')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('status')}
                      className="font-medium hover:text-foreground flex items-center gap-1"
                    >
                      Status {getSortIcon('status')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('riskScore')}
                      className="font-medium hover:text-foreground flex items-center gap-1"
                    >
                      Risk {getSortIcon('riskScore')}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No transactions found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/transactions/${transaction.id}`)
                      }
                    >
                      <TableCell className="font-medium">
                        {transaction.id}
                      </TableCell>
                      <TableCell>{transaction.providerName}</TableCell>
                      <TableCell>{transaction.insuranceName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCents(transaction.claimAmountCents)}
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.disbursementDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.expectedCollectionDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(transaction.status)}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getRiskBadgeStyles(transaction.riskLevel)}
                        >
                          {transaction.riskLevel.charAt(0).toUpperCase() +
                            transaction.riskLevel.slice(1)}{' '}
                          ({transaction.riskScore})
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/transactions/${transaction.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
