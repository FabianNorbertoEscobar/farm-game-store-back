import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/auth.service.js", () => ({
  loginService: vi.fn(),
}));

vi.mock("../src/services/products.service.js", () => ({
  getAllProductsService: vi.fn(),
  getProductByIdService: vi.fn(),
  createProductService: vi.fn(),
  replaceProductService: vi.fn(),
  patchProductService: vi.fn(),
  deleteProductService: vi.fn(),
}));

import { loginService } from "../src/services/auth.service.js";
import {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getProductByIdService,
  patchProductService,
  replaceProductService,
} from "../src/services/products.service.js";
import { loginController } from "../src/controllers/auth.controller.js";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  patchProductController,
  replaceProductController,
} from "../src/controllers/products.controller.js";

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe("controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loginController devuelve token", async () => {
    loginService.mockResolvedValue({ token: "abc" });
    const res = createRes();
    const next = vi.fn();

    await loginController({ body: { email: "a", password: "b" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ type: "Bearer", token: "abc" });
  });

  it("loginController deriva error a next", async () => {
    const error = new Error("boom");
    loginService.mockRejectedValue(error);
    const next = vi.fn();

    await loginController({ body: {} }, createRes(), next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("getAllProductsController responde 200", async () => {
    getAllProductsService.mockResolvedValue([{ id: 1 }]);
    const res = createRes();

    await getAllProductsController({}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("getProductByIdController devuelve 404 si no existe", async () => {
    getProductByIdService.mockResolvedValue(null);
    const res = createRes();

    await getProductByIdController({ params: { id: "1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Producto no encontrado",
    });
  });

  it("getProductByIdController devuelve 200 si existe", async () => {
    getProductByIdService.mockResolvedValue({ id: 1 });
    const res = createRes();

    await getProductByIdController({ params: { id: "1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("createProductController responde 201", async () => {
    createProductService.mockResolvedValue({ id: 2 });
    const res = createRes();

    await createProductController({ body: {} }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 2 });
  });

  it("replaceProductController responde 404 si no existe", async () => {
    replaceProductService.mockResolvedValue(null);
    const res = createRes();

    await replaceProductController(
      { params: { id: "1" }, body: {} },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Producto no encontrado",
    });
  });

  it("replaceProductController responde 200", async () => {
    replaceProductService.mockResolvedValue({ id: 1, price: 10 });
    const res = createRes();

    await replaceProductController(
      { params: { id: "1" }, body: { price: 10 } },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1, price: 10 });
  });

  it("patchProductController responde 200", async () => {
    patchProductService.mockResolvedValue({ id: 1, price: 10 });
    const res = createRes();

    await patchProductController(
      { params: { id: "1" }, body: { price: 10 } },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 1, price: 10 });
  });

  it("patchProductController responde 404 si no existe", async () => {
    patchProductService.mockResolvedValue(null);
    const res = createRes();

    await patchProductController(
      { params: { id: "1" }, body: { price: 10 } },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Producto no encontrado",
    });
  });

  it("deleteProductController responde 404 si no existe", async () => {
    deleteProductService.mockResolvedValue(null);
    const res = createRes();

    await deleteProductController({ params: { id: "1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Producto no encontrado",
    });
  });

  it("deleteProductController responde 200", async () => {
    deleteProductService.mockResolvedValue({ id: 1 });
    const res = createRes();

    await deleteProductController({ params: { id: "1" } }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Producto eliminado",
      product: { id: 1 },
    });
  });

  it("controllers de products envian error a next", async () => {
    const error = new Error("x");
    const next = vi.fn();
    getAllProductsService.mockRejectedValueOnce(error);
    await getAllProductsController({}, createRes(), next);

    getProductByIdService.mockRejectedValueOnce(error);
    await getProductByIdController({ params: { id: "1" } }, createRes(), next);

    createProductService.mockRejectedValueOnce(error);
    await createProductController({ body: {} }, createRes(), next);

    replaceProductService.mockRejectedValueOnce(error);
    await replaceProductController(
      { params: { id: "1" }, body: {} },
      createRes(),
      next,
    );

    patchProductService.mockRejectedValueOnce(error);
    await patchProductController(
      { params: { id: "1" }, body: {} },
      createRes(),
      next,
    );

    deleteProductService.mockRejectedValueOnce(error);
    await deleteProductController({ params: { id: "1" } }, createRes(), next);

    expect(next).toHaveBeenCalledTimes(6);
  });
});
