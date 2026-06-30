import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { appLogger } from "../utils/logger.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    appLogger.warn(
      "Fallo de autenticacion: token faltante o con formato invalido",
      {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      },
    );
    return res.status(401).json({ message: "Token no provisto o invalido" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    appLogger.debug("Autenticacion JWT exitosa", {
      requestId: req.requestId,
      user: payload.sub,
      role: payload.role,
    });
    return next();
  } catch {
    appLogger.warn("Fallo de autenticacion: token invalido o expirado", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(403).json({ message: "Token invalido o expirado" });
  }
};
