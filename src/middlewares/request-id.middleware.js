import { randomUUID } from "crypto";

export const requestIdMiddleware = (req, res, next) => {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  return next();
};
