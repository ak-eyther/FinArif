"use client";

import { useCallback, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ShieldCheck, ShieldOff } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  bannerMessage?: string;
}

const EMAIL_PATTERN = /^(?:[A-Z0-9._%+-]+)@(?:[A-Z0-9.-]+)\.[A-Z]{2,}$/i;

export function LoginForm({ bannerMessage }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = useMemo(() => {
    const redirectParam = searchParams.get('redirectTo');
    return redirectParam && redirectParam.startsWith('/') ? redirectParam : '/';
  }, [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return EMAIL_PATTERN.test(email.trim()) && password.trim().length >= 8;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      if (!EMAIL_PATTERN.test(trimmedEmail) || trimmedPassword.length === 0) {
        setError('Enter a valid email and password.');
        return;
      }

      try {
        setIsSubmitting(true);

        const result = await signIn('credentials', {
          email: trimmedEmail,
          password: trimmedPassword,
          redirect: false,
          redirectTo,
        });

        if (result?.error) {
          setError('Incorrect email or password.');
          setIsSubmitting(false);
          return;
        }

        router.push(redirectTo);
        router.refresh();
      } catch (submissionError) {
        console.error('Login submission failed', submissionError);
        setError('Something went wrong. Please try again in a few moments.');
        setIsSubmitting(false);
      }
    },
    [email, password, redirectTo, router]
  );

  return (
    <Card className="w-full max-w-md bg-white/90 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-2xl font-semibold text-slate-900">FinArif Admin Access</CardTitle>
            <CardDescription className="text-slate-600">
              Secure board dashboard for Kenyan healthcare financing analytics
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {bannerMessage ? (
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Authorized personnel only</AlertTitle>
            <AlertDescription>{bannerMessage}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Authentication failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label className="text-slate-700" htmlFor="email">
              Work email
            </Label>
            <Input
              id="email"
              placeholder="admin@finarif.com"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
              minLength={8}
            />
            <p className="text-xs text-slate-500">
              Tip: use your secure seed credential provided during deployment.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in to dashboard'}
          </Button>
        </form>

        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-700">Security reminders:</p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Single sign-on access for FinArif administrators</li>
            <li>Password stored with bcrypt (12 rounds) in Vercel Postgres</li>
            <li>Sessions expire after 60 minutes of inactivity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
