export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  fullName: string;
  role: string;
  created_at: Date;
}
