import { describe, expect, it } from "vitest";
import { authRouter } from "../src/routes/auth.routes.js";
import { productsRouter } from "../src/routes/products.routes.js";

const getRoute = (router, method, path) =>
  router.stack.find(
    (layer) =>
      layer.route && layer.route.path === path && layer.route.methods[method],
  );

describe("routes", () => {
  it("auth.routes define POST /login", () => {
    const route = getRoute(authRouter, "post", "/login");
    expect(route).toBeTruthy();
  });

  it("products.routes define rutas requeridas", () => {
    expect(getRoute(productsRouter, "get", "/")).toBeTruthy();
    expect(getRoute(productsRouter, "get", "/:id")).toBeTruthy();
    expect(getRoute(productsRouter, "post", "/create")).toBeTruthy();
    expect(getRoute(productsRouter, "put", "/:id")).toBeTruthy();
    expect(getRoute(productsRouter, "patch", "/:id")).toBeTruthy();
    expect(getRoute(productsRouter, "delete", "/:id")).toBeTruthy();
  });
});
