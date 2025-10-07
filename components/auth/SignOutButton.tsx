"use client";

import { useState } from 'react';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: '/login' });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-100"
      onClick={handleSignOut}
      disabled={isSigningOut}
    >
      <LogOut className="h-4 w-4" />
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
