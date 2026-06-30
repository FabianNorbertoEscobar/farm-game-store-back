import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const loginService = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("email y password son obligatorios");
    error.status = 400;
    throw error;
  }

  if (email !== env.authUserEmail || password !== env.authUserPassword) {
    const error = new Error("Credenciales invalidas");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: email,
      role: "admin",
    },
    env.jwtSecret,
    { expiresIn: "2h" },
  );

  return { token };
};
