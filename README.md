# FinArif Finance Model Calculator

An interactive HTML-based calculator to understand trade finance economics and P&L modeling.

## Overview
Simple, self-contained web application that helps visualize and calculate the profitability of trade finance transactions (invoice factoring, purchase order financing, letters of credit).

## Features
- 💰 **Real-time P&L Calculation**: Revenue, costs, net profit, and ROE
- 🎨 **Beautiful Interface**: Modern, responsive design
- 📊 **Detailed Breakdown**: See exactly where money flows
- ✏️ **Fully Editable**: Adjust all parameters instantly
- 📱 **Mobile Friendly**: Works on any device

## How to Use
1. Open `finance-model.html` in any web browser
2. Adjust transaction parameters:
   - Transaction amount
   - Duration (days)
   - Fee rate (%)
   - Insurance cost (%)
   - Cost of funds (%)
   - Operating cost (%)
3. Click "Calculate P&L" to see results

## Finance Model Explained

### Revenue
- **Fee Income**: Customer pays a fee (typically 3-5%) on transaction amount

### Costs
- **Cost of Funds**: Interest on capital deployed (prorated for transaction duration)
- **Insurance**: Credit insurance to protect against defaults
- **Operations**: Overhead, staff, technology costs

### Profitability Metrics
- **Net Profit** = Revenue - Total Costs
- **Profit Margin** = Net Profit / Revenue
- **ROE (Return on Equity)** = (Net Profit / Capital) × (365 / Duration) - annualized

## Example Transaction
- Amount: KES 5,000,000
- Duration: 90 days
- Fee: 4%
- Insurance: 1.5%
- Cost of Funds: 12% p.a.
- Operations: 0.5%

**Result**: ~KES 137,000 net profit, 27% ROE annualized

## Technical Details
- Pure HTML/CSS/JavaScript
- No dependencies, frameworks, or build tools
- Works offline
- ~14KB single file

## License
Proprietary - FinArif
