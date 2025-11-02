import type { AccessTokenPayload } from '@/utils/jwt.util';

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      role?: string;
    }

    interface Locals extends Record<string, unknown> {
      user: User | null;
      isAuthenticated?: boolean;
    }

    interface Request {
      auth?: { payload?: AccessTokenPayload };
      user?: User;
      isAuthenticated(): boolean;
      logout(callback?: (err?: unknown) => void): void;
    }
  }
}
