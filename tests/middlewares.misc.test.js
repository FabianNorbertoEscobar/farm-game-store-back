import { describe, expect, it, vi } from "vitest";
import { errorMiddleware } from "../src/middlewares/error.middleware.js";
import { notFoundMiddleware } from "../src/middlewares/not-found.middleware.js";

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe("middlewares auxiliares", () => {
  it("errorMiddleware usa status y message del error", () => {
    const res = createRes();
    errorMiddleware({ status: 418, message: "teapot" }, {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({ message: "teapot" });
  });

  it("errorMiddleware usa defaults", () => {
    const res = createRes();
    errorMiddleware({}, {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error interno del servidor",
    });
  });

  it("notFoundMiddleware responde 404", () => {
    const res = createRes();
    notFoundMiddleware({}, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Ruta no encontrada" });
  });
});
