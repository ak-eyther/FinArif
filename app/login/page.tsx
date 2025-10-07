import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'FinArif Admin Login',
  description: 'Secure access to FinArif provider financing analytics dashboard',
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 px-16 py-20 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.35),transparent_55%)]" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-blue-200">FinArif</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight">
                Provider Financing Intelligence
              </h1>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            <p className="max-w-lg text-lg text-blue-100">
              Unlock T+1 settlement insights for Kenyan healthcare providers. Monitor capital deployment,
              risk stratification, and insurer collections in a single executive workspace.
            </p>
            <div className="grid gap-4 text-sm text-blue-100 md:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-blue-200">Capital Efficiency</p>
                <p className="mt-2 text-base font-semibold text-white">4.5% target NIM with live stress tests</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-blue-200">Risk Controls</p>
                <p className="mt-2 text-base font-semibold text-white">Automated fraud & arrears escalation</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-blue-200">Portfolio Health</p>
                <p className="mt-2 text-base font-semibold text-white">18 live claims feeds with drill-downs</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-blue-200">Collections Pipeline</p>
                <p className="mt-2 text-base font-semibold text-white">Predictive reimbursements across payers</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs tracking-wide text-blue-200/80">
            <span>© {new Date().getFullYear()} FinArif Capital Partners</span>
            <span>Kenya · HealthTech · Finance</span>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-100/60 px-6 py-12 sm:px-12">
          <div className="w-full max-w-lg space-y-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.4em] text-blue-600">
                Secure Login
              </h2>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                Board-grade analytics, protected behind single admin access
              </p>
              <p className="mt-3 text-base text-slate-600">
                Use the credential issued during environment provisioning. For production, rotate passwords via
                the migration script before deployment.
              </p>
            </div>

            <LoginForm bannerMessage="Email + password credentials stored in Vercel Postgres" />

            <div className="text-xs text-slate-500">
              <p>Need access? Contact the FinArif capital diligence team.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
