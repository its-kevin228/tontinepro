import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

// Restreint une route à un ou plusieurs rôles
// Usage : router.get("/admin", requireAuth, requireRole("SUPER_ADMIN"), handler)
// Usage multiple : requireRole("SUPER_ADMIN", "ORGANISATEUR")
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Non authentifié" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Accès refusé. Rôle requis : ${roles.join(" ou ")}`,
      });
      return;
    }

    next();
  };
}