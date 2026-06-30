import { appLogger } from "../utils/logger.js";

export const errorMiddleware = (error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Error interno del servidor";

  appLogger.error("Error en request", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    message,
    stack: error.stack,
  });

  return res.status(status).json({ message });
};
