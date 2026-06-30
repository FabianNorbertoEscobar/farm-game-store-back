import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/products.model.js", () => ({
  createProductModel: vi.fn(),
  deleteProductModel: vi.fn(),
  getAllProductsModel: vi.fn(),
  getProductByIdModel: vi.fn(),
  updateProductModel: vi.fn(),
}));

import {
  createProductModel,
  deleteProductModel,
  getAllProductsModel,
  getProductByIdModel,
  updateProductModel,
} from "../src/models/products.model.js";

import {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getProductByIdService,
  patchProductService,
  replaceProductService,
} from "../src/services/products.service.js";

describe("products.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates getAll/getById/delete", async () => {
    getAllProductsModel.mockResolvedValue([{ id: 1 }]);
    getProductByIdModel.mockResolvedValue({ id: 1 });
    deleteProductModel.mockResolvedValue({ id: 1 });

    await expect(getAllProductsService()).resolves.toEqual([{ id: 1 }]);
    await expect(getProductByIdService("1")).resolves.toEqual({ id: 1 });
    await expect(deleteProductService("1")).resolves.toEqual({ id: 1 });
  });

  it("create valida campos requeridos y price", async () => {
    await expect(createProductService({})).rejects.toMatchObject({
      status: 400,
    });
    await expect(
      createProductService({ title: "A", category: "B", price: -1 }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      createProductService({ title: "A", category: "B", price: "abc" }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("create valida id manual", async () => {
    await expect(
      createProductService({ title: "A", category: "B", price: 1, id: 0 }),
    ).rejects.toMatchObject({
      status: 400,
      message: "id debe ser un numero entero positivo",
    });
  });

  it("create normaliza payload y delega", async () => {
    createProductModel.mockResolvedValue({ id: 1 });

    await createProductService({
      title: "T",
      category: "decoracion",
      img: "/i.png",
      price: "10",
    });

    expect(createProductModel).toHaveBeenCalledWith({
      id: undefined,
      title: "T",
      category: "decoracion",
      img: "/i.png",
      price: 10,
    });
  });

  it("create permite id valido y lo convierte a numero", async () => {
    createProductModel.mockResolvedValue({ id: 2 });

    await createProductService({
      id: "2",
      title: "T",
      category: "decoracion",
      price: 10,
    });

    expect(createProductModel).toHaveBeenCalledWith({
      id: 2,
      title: "T",
      category: "decoracion",
      img: "",
      price: 10,
    });
  });

  it("patch valida payload", async () => {
    await expect(patchProductService("1", {})).rejects.toMatchObject({
      status: 400,
      message: "Debes enviar al menos un campo para actualizar",
    });

    await expect(patchProductService("1", { title: "" })).rejects.toMatchObject(
      { status: 400 },
    );
    await expect(
      patchProductService("1", { category: "" }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(patchProductService("1", { price: -1 })).rejects.toMatchObject(
      { status: 400 },
    );
    await expect(patchProductService("1", { img: 123 })).rejects.toMatchObject({
      status: 400,
    });
    await expect(patchProductService("1", { id: 10 })).rejects.toMatchObject({
      status: 400,
    });
  });

  it("patch delega payload normalizado", async () => {
    updateProductModel.mockResolvedValue({ id: 1, price: 99 });

    const result = await patchProductService("1", { price: "99", img: "x" });

    expect(updateProductModel).toHaveBeenCalledWith("1", {
      price: 99,
      img: "x",
    });
    expect(result).toEqual({ id: 1, price: 99 });
  });

  it("replace exige payload completo", async () => {
    await expect(
      replaceProductService("1", { title: "A", category: "B" }),
    ).rejects.toMatchObject({
      status: 400,
      message: "title, price y category son obligatorios",
    });
  });

  it("replace normaliza y completa img faltante", async () => {
    updateProductModel.mockResolvedValue({
      id: 1,
      title: "A",
      category: "B",
      price: 10,
      img: "",
    });

    const result = await replaceProductService("1", {
      title: "A",
      category: "B",
      price: "10",
    });

    expect(updateProductModel).toHaveBeenCalledWith("1", {
      title: "A",
      category: "B",
      price: 10,
      img: "",
    });
    expect(result).toEqual({
      id: 1,
      title: "A",
      category: "B",
      price: 10,
      img: "",
    });
  });
});
