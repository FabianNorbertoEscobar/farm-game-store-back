import { appLogger } from "../utils/logger.js";

export const notFoundMiddleware = (req, res) => {
  appLogger.warn("Ruta no encontrada", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });
  return res.status(404).json({ message: "Ruta no encontrada" });
};
