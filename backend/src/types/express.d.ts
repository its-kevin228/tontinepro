import { UserRole, UserStatus } from "@prisma/client";

// Extension du type Request d'Express pour inclure req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export {};