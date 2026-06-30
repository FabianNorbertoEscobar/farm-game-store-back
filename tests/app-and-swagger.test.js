import request from "supertest";
import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { env } from "../src/config/env.js";
import { swaggerSpec } from "../src/docs/swagger.js";

describe("app y swagger", () => {
  it("GET /health responde ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("GET /api-docs.json responde el spec", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toBe(swaggerSpec.info.title);
  });

  it("GET /api-docs responde swagger ui", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Swagger UI");
  });

  it("ruta inexistente responde 404", async () => {
    const res = await request(app).get("/no-existe");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Ruta no encontrada" });
  });

  it("swagger contiene componentes clave", () => {
    expect(swaggerSpec.servers).toBeFalsy();
    expect(swaggerSpec.paths["/auth/login"]).toBeTruthy();
    expect(swaggerSpec.paths["/api/products/{id}"].patch).toBeTruthy();
    expect(swaggerSpec.components.responses.InternalServerError).toBeTruthy();
  });

  it("request autenticada cubre morgan token user", async () => {
    const token = jwt.sign({ sub: "admin@test.com" }, env.jwtSecret, {
      expiresIn: "2h",
    });

    const res = await request(app)
      .get("/api/products/not-a-number")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("no encontrado");
  });

  it("request autenticada sin sub cae en user anonymous", async () => {
    const token = jwt.sign({ role: "admin" }, env.jwtSecret, {
      expiresIn: "2h",
    });

    const res = await request(app)
      .get("/api/products/not-a-number")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("no encontrado");
  });
});
