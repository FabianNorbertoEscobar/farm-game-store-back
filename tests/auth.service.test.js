import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "jwt.token"),
  },
}));

vi.mock("../src/config/env.js", () => ({
  env: {
    authUserEmail: "admin@test.com",
    authUserPassword: "123456",
    jwtSecret: "secret",
  },
}));

import jwt from "jsonwebtoken";
import { loginService } from "../src/services/auth.service.js";

describe("loginService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lanza 400 si faltan credenciales", async () => {
    await expect(
      loginService({ email: "", password: "" }),
    ).rejects.toMatchObject({
      status: 400,
      message: "email y password son obligatorios",
    });
  });

  it("lanza 401 si credenciales invalidas", async () => {
    await expect(
      loginService({ email: "bad@test.com", password: "123456" }),
    ).rejects.toMatchObject({
      status: 401,
      message: "Credenciales invalidas",
    });
  });

  it("retorna token si credenciales validas", async () => {
    const result = await loginService({
      email: "admin@test.com",
      password: "123456",
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        sub: "admin@test.com",
        role: "admin",
      },
      "secret",
      { expiresIn: "2h" },
    );
    expect(result).toEqual({ token: "jwt.token" });
  });
});
