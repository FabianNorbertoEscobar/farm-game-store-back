import { describe, expect, it, vi, beforeEach } from "vitest";

describe("env config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.doMock("dotenv", () => ({
      default: {
        config: vi.fn(),
      },
    }));
    process.env = { ...originalEnv };
  });

  it("usa valores por defecto", async () => {
    delete process.env.PORT;
    delete process.env.JWT_SECRET;
    delete process.env.AUTH_USER_EMAIL;
    delete process.env.AUTH_USER_PASSWORD;
    delete process.env.FIREBASE_PRODUCTS_COLLECTION;

    const { env } = await import("../src/config/env.js");

    expect(env.port).toBe(3000);
    expect(env.jwtSecret).toBe("change_this_secret");
    expect(env.authUserEmail).toBe("admin@farmgamestore.com");
    expect(env.authUserPassword).toBe("123456");
    expect(env.firebaseProductsCollection).toBe("products-test");
  });

  it("toma valores del entorno", async () => {
    process.env.PORT = "4000";
    process.env.JWT_SECRET = "jwt";
    process.env.AUTH_USER_EMAIL = "e@test.com";
    process.env.AUTH_USER_PASSWORD = "p";
    process.env.FIREBASE_AUTH_EMAIL = "fa@test.com";
    process.env.FIREBASE_AUTH_PASSWORD = "fp";
    process.env.FIREBASE_API_KEY = "k";
    process.env.FIREBASE_AUTH_DOMAIN = "d";
    process.env.FIREBASE_PROJECT_ID = "pid";
    process.env.FIREBASE_STORAGE_BUCKET = "sb";
    process.env.FIREBASE_MESSAGING_SENDER_ID = "ms";
    process.env.FIREBASE_APP_ID = "aid";
    process.env.FIREBASE_PRODUCTS_COLLECTION = "custom-products";

    const { env } = await import("../src/config/env.js");

    expect(env.port).toBe(4000);
    expect(env.jwtSecret).toBe("jwt");
    expect(env.authUserEmail).toBe("e@test.com");
    expect(env.authUserPassword).toBe("p");
    expect(env.firebaseAuthEmail).toBe("fa@test.com");
    expect(env.firebaseAuthPassword).toBe("fp");
    expect(env.firebaseApiKey).toBe("k");
    expect(env.firebaseAuthDomain).toBe("d");
    expect(env.firebaseProjectId).toBe("pid");
    expect(env.firebaseStorageBucket).toBe("sb");
    expect(env.firebaseMessagingSenderId).toBe("ms");
    expect(env.firebaseAppId).toBe("aid");
    expect(env.firebaseProductsCollection).toBe("custom-products");
  });

  it("fallback de firebase auth al auth user", async () => {
    process.env.AUTH_USER_EMAIL = "x@test.com";
    process.env.AUTH_USER_PASSWORD = "xpass";
    delete process.env.FIREBASE_AUTH_EMAIL;
    delete process.env.FIREBASE_AUTH_PASSWORD;

    const { env } = await import("../src/config/env.js");

    expect(env.firebaseAuthEmail).toBe("x@test.com");
    expect(env.firebaseAuthPassword).toBe("xpass");
  });

  it("en produccion exige variables sensibles", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;

    await expect(import("../src/config/env.js")).rejects.toThrow(
      "Falta variable de entorno requerida: JWT_SECRET",
    );
  });
});
