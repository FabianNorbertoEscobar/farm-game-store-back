import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../src/config/env.js", () => ({
  env: { jwtSecret: "secret" },
}));

import jwt from "jsonwebtoken";
import { authMiddleware } from "../src/middlewares/auth.middleware.js";

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 401 si no hay header", () => {
    const req = { headers: {} };
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token no provisto o invalido",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 403 si token invalido", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    const req = { headers: { authorization: "Bearer bad.token" } };
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalido o expirado",
    });
  });

  it("continua si token valido", () => {
    jwt.verify.mockReturnValue({ sub: "admin@test.com" });

    const req = { headers: { authorization: "Bearer ok.token" } };
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ sub: "admin@test.com" });
    expect(next).toHaveBeenCalled();
  });
});
