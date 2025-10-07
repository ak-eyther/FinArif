import type { AuthRole } from '@/lib/types/auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: AuthRole;
      fullName: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: AuthRole;
    fullName: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: AuthRole;
    fullName?: string;
  }
}
