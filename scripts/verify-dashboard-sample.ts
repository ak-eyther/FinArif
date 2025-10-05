/**
 * Verification script - Show sample dashboard data with detailed breakdown
 */

import { getTransactions } from '../lib/mock-data';
import { calculateDashboardMetrics } from '../lib/calculations/dashboard';
import { formatCents, formatPercentage, formatDateShort } from '../lib/utils/format';

console.log('FinArif Dashboard - Sample Data Verification');
console.log('='.repeat(70));
console.log('');

// Get all transactions
const transactions = getTransactions();

// Calculate metrics
const metrics = calculateDashboardMetrics(transactions);

// Summary Stats
console.log('TRANSACTION SUMMARY:');
console.log('-'.repeat(70));
console.log(`Total Transactions:      ${transactions.length}`);
console.log(`Active:                  ${transactions.filter(tx => tx.status === 'active').length}`);
console.log(`Collected:               ${transactions.filter(tx => tx.status === 'collected').length}`);
console.log(`Defaulted:               ${transactions.filter(tx => tx.status === 'defaulted').length}`);
console.log('');

// Key Metrics
console.log('KEY METRICS:');
console.log('-'.repeat(70));

console.log('\n1. Total Outstanding to Providers (KES)');
console.log(`   Value:       ${formatCents(metrics.totalOutstandingCents)}`);
console.log(`   Trend:       ${metrics.trendOutstanding.toUpperCase()}`);
console.log(`   Description: Sum of all active claim amounts paid to providers`);

console.log('\n2. Total Expected from Insurers (KES)');
console.log(`   Value:       ${formatCents(metrics.totalExpectedCents)}`);
console.log(`   Trend:       ${metrics.trendExpected.toUpperCase()}`);
console.log(`   Description: Expected collections including our fees`);

console.log('\n3. Net Exposure (KES)');
console.log(`   Value:       ${formatCents(metrics.netExposureCents)}`);
console.log(`   Trend:       ${metrics.trendExposure.toUpperCase()}`);
console.log(`   Description: Expected profit (Total Expected - Total Outstanding)`);

console.log('\n4. Portfolio NIM (%)');
console.log(`   Value:       ${formatPercentage(metrics.portfolioNIM)}`);
console.log(`   Trend:       ${metrics.trendNIM.toUpperCase()}`);
console.log(`   Description: Net interest margin after capital costs`);
console.log(`   Target:      ≥ 4.00% (Current: ${metrics.portfolioNIM >= 0.04 ? 'ABOVE' : 'BELOW'} target)`);

// Recent Transactions Sample
console.log('\n');
console.log('RECENT TRANSACTIONS (Top 5):');
console.log('-'.repeat(70));

const recentTransactions = transactions
  .sort((a, b) => b.disbursementDate.getTime() - a.disbursementDate.getTime())
  .slice(0, 5);

recentTransactions.forEach((tx, idx) => {
  console.log(`\n${idx + 1}. ${tx.id} - ${tx.providerName}`);
  console.log(`   Insurer:     ${tx.insuranceName}`);
  console.log(`   Amount:      ${formatCents(tx.claimAmountCents)}`);
  console.log(`   Date:        ${formatDateShort(tx.disbursementDate)}`);
  console.log(`   Status:      ${tx.status.toUpperCase()}`);
  console.log(`   Risk Level:  ${tx.riskLevel.toUpperCase()}`);
});

console.log('\n');
console.log('='.repeat(70));
console.log('Verification completed successfully!');
console.log('Dashboard page ready at: app/(dashboard)/page.tsx');
console.log('='.repeat(70));
