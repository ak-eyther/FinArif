/**
 * Login page
 * Sleek, modern login interface with email/password authentication
 */

import { LoginForm } from '@/components/auth/login-form';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <span className="text-2xl font-bold text-white">FinArif</span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Healthcare Claims
            <br />
            Financing Platform
          </h1>
          <p className="text-lg text-blue-100">
            Secure, intelligent financial management for healthcare providers across Kenya
          </p>

          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-time Analytics</h3>
                <p className="text-sm text-blue-100">
                  Monitor portfolio performance with live dashboards
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Enterprise Security</h3>
                <p className="text-sm text-blue-100">
                  Bank-grade encryption and role-based access control
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Risk Management</h3>
                <p className="text-sm text-blue-100">
                  AI-powered risk scoring and capital optimization
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-200">
          © 2025 FinArif. Healthcare Finance Platform.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col justify-center bg-slate-50 px-8 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <span className="text-xl font-bold text-slate-900">FinArif</span>
          </div>

          {/* Login Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-slate-600">
              Sign in to your account to access the dashboard
            </p>
          </div>

          <Separator />

          {/* Login Form */}
          <LoginForm />

          {/* Demo Credentials Helper */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <p className="mb-2 text-sm font-medium text-blue-900">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <p>
                <strong>Admin:</strong> admin@finarif.com / password123
              </p>
              <p>
                <strong>Finance:</strong> finance@finarif.com / password123
              </p>
              <p>
                <strong>Risk:</strong> risk@finarif.com / password123
              </p>
              <p>
                <strong>Accountant:</strong> accountant@finarif.com / password123
              </p>
              <p>
                <strong>Viewer:</strong> viewer@finarif.com / password123
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
