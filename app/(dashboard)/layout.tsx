/**
 * Dashboard layout with sidebar navigation
 *
 * Provides consistent layout for all dashboard pages with:
 * - Sidebar navigation to key sections
 * - Header with FinArif branding
 * - Professional healthcare fintech styling
 */

import Link from 'next/link';
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    label: 'Risk Analysis',
    href: '/risk',
    icon: TrendingUp,
  },
  {
    label: 'Capital Management',
    href: '/capital',
    icon: Wallet,
  },
];

/**
 * Dashboard layout component
 * Wraps all dashboard pages with consistent navigation and branding
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white">
        {/* Brand Header */}
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">FinArif</span>
          </Link>
        </div>

        <Separator />

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 w-64 border-t border-slate-200 p-4">
          <p className="text-xs text-slate-500">Healthcare Claims Finance</p>
          <p className="text-xs font-medium text-slate-700">Kenyan Market</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                FinArif Dashboard
              </h1>
              <p className="text-sm text-slate-600">
                Healthcare Claims Financing Platform
              </p>
            </div>

            {/* User info placeholder - can be enhanced later */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Board View</p>
                <p className="text-xs text-slate-600">Executive Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
