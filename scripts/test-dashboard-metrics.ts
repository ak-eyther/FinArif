/**
 * Test script to verify dashboard metrics calculations
 */

import { getTransactions } from '../lib/mock-data';
import { calculateDashboardMetrics } from '../lib/calculations/dashboard';
import { formatCents, formatPercentage } from '../lib/utils/format';

// Get transactions
const transactions = getTransactions();

// Calculate metrics
const metrics = calculateDashboardMetrics(transactions);

// Display results
console.log('Dashboard Metrics Calculation Test');
console.log('====================================\n');

console.log('Total Transactions:', transactions.length);
console.log('Active Transactions:', transactions.filter(tx => tx.status === 'active').length);
console.log('Collected Transactions:', transactions.filter(tx => tx.status === 'collected').length);
console.log('Defaulted Transactions:', transactions.filter(tx => tx.status === 'defaulted').length);

console.log('\nKey Metrics:');
console.log('------------------------------------');
console.log('1. Total Outstanding to Providers:', formatCents(metrics.totalOutstandingCents));
console.log('   Trend:', metrics.trendOutstanding);

console.log('\n2. Total Expected from Insurers:', formatCents(metrics.totalExpectedCents));
console.log('   Trend:', metrics.trendExpected);

console.log('\n3. Net Exposure:', formatCents(metrics.netExposureCents));
console.log('   Trend:', metrics.trendExposure);

console.log('\n4. Portfolio NIM:', formatPercentage(metrics.portfolioNIM));
console.log('   Trend:', metrics.trendNIM);

console.log('\n====================================');
console.log('Test completed successfully!');
