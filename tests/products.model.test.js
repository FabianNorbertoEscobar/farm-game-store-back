import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env.js", () => ({
  env: {
    firebaseProductsCollection: "products-test",
  },
}));

vi.mock("../src/config/firebase.js", () => ({
  db: { db: true },
  hasFirebaseConfig: true,
  ensureFirebaseSession: vi.fn(async () => ({ db: true })),
}));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn((db, name) => ({ db, name })),
  deleteDoc: vi.fn(),
  doc: vi.fn((db, name, id) => ({ db, name, id })),
  getDocs: vi.fn(),
  limit: vi.fn((n) => ({ limit: n })),
  orderBy: vi.fn((field, dir) => ({ orderBy: [field, dir] })),
  query: vi.fn((...args) => ({ args })),
  serverTimestamp: vi.fn(() => "ts"),
  updateDoc: vi.fn(),
  where: vi.fn((f, op, v) => ({ where: [f, op, v] })),
}));

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ensureFirebaseSession } from "../src/config/firebase.js";
import {
  createProductModel,
  deleteProductModel,
  getAllProductsModel,
  getProductByIdModel,
  updateProductModel,
} from "../src/models/products.model.js";

const makeDoc = ({
  docId = "doc-1",
  id = 1,
  title = "T",
  category = "decoracion",
  img = "",
  price = 10,
} = {}) => ({
  id: docId,
  data: () => ({ id, title, category, img, price }),
});

describe("products.model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllProductsModel mapea productos", async () => {
    getDocs.mockResolvedValueOnce({
      docs: [makeDoc({ id: 1 }), makeDoc({ docId: "doc-2", id: 2 })],
    });

    const result = await getAllProductsModel();

    expect(collection).toHaveBeenCalledWith({ db: true }, "products-test");
    expect(ensureFirebaseSession).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 1, title: "T", category: "decoracion", img: "", price: 10 },
      { id: 2, title: "T", category: "decoracion", img: "", price: 10 },
    ]);
  });

  it("getAllProductsModel traduce permission-denied", async () => {
    const err = new Error("x");
    err.code = "permission-denied";
    getDocs.mockRejectedValueOnce(err);

    await expect(getAllProductsModel()).rejects.toMatchObject({
      status: 500,
      message:
        "Firestore rechazo la operacion. Verifica reglas de seguridad o credenciales de Firebase Auth.",
    });
  });

  it("getAllProductsModel propaga otros errores", async () => {
    const err = new Error("otro");
    getDocs.mockRejectedValueOnce(err);
    await expect(getAllProductsModel()).rejects.toThrow("otro");
  });

  it("getProductByIdModel retorna null si no existe", async () => {
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    const result = await getProductByIdModel("999");
    expect(result).toBeNull();
  });

  it("getProductByIdModel retorna producto si existe", async () => {
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [makeDoc({ id: 7, title: "A" })],
    });
    const result = await getProductByIdModel("7");
    expect(result).toEqual({
      id: 7,
      title: "A",
      category: "decoracion",
      img: "",
      price: 10,
    });
  });

  it("createProductModel crea con id calculado", async () => {
    getDocs
      .mockResolvedValueOnce({ empty: true, docs: [] })
      .mockResolvedValueOnce({ empty: true, docs: [] });

    const payload = {
      title: "N",
      category: "decoracion",
      img: "/i.png",
      price: 100,
    };
    const result = await createProductModel(payload);

    expect(serverTimestamp).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalled();
    expect(result).toEqual({
      id: 1,
      title: "N",
      category: "decoracion",
      img: "/i.png",
      price: 100,
    });
  });

  it("createProductModel calcula id siguiente cuando hay ultimo", async () => {
    getDocs
      .mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => ({ id: 5 }) }],
      })
      .mockResolvedValueOnce({ empty: true, docs: [] });

    await createProductModel({
      title: "N",
      category: "decoracion",
      img: "",
      price: 100,
    });

    const created = addDoc.mock.calls[0][1];
    expect(created.id).toBe(6);
  });

  it("createProductModel rechaza id duplicado", async () => {
    getDocs.mockResolvedValueOnce({ empty: false, docs: [makeDoc({ id: 2 })] });

    await expect(
      createProductModel({
        id: 2,
        title: "N",
        category: "decoracion",
        img: "",
        price: 100,
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Ya existe un producto con ese id",
    });
  });

  it("updateProductModel actualiza y retorna merge", async () => {
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [makeDoc({ docId: "abc", id: 3, price: 10 })],
    });

    const result = await updateProductModel("3", { price: 999 });

    expect(updateDoc).toHaveBeenCalledWith(
      { db: { db: true }, name: "products-test", id: "abc" },
      { price: 999 },
    );
    expect(result).toEqual({
      id: 3,
      title: "T",
      category: "decoracion",
      img: "",
      price: 999,
    });
  });

  it("updateProductModel retorna null si no existe", async () => {
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    const result = await updateProductModel("3", { price: 1 });
    expect(result).toBeNull();
  });

  it("deleteProductModel elimina y retorna producto", async () => {
    getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [makeDoc({ docId: "xyz", id: 4 })],
    });

    const result = await deleteProductModel("4");

    expect(deleteDoc).toHaveBeenCalledWith({
      db: { db: true },
      name: "products-test",
      id: "xyz",
    });
    expect(result).toEqual({
      id: 4,
      title: "T",
      category: "decoracion",
      img: "",
      price: 10,
    });
  });

  it("deleteProductModel retorna null si no existe", async () => {
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] });
    const result = await deleteProductModel("4");
    expect(result).toBeNull();
  });

  it("model methods traducen permission-denied", async () => {
    const err = new Error("x");
    err.code = "permission-denied";

    getDocs.mockRejectedValueOnce(err);
    await expect(getProductByIdModel("1")).rejects.toMatchObject({
      status: 500,
    });

    getDocs.mockRejectedValueOnce(err);
    await expect(
      createProductModel({
        id: 1,
        title: "N",
        category: "c",
        img: "",
        price: 1,
      }),
    ).rejects.toMatchObject({ status: 500 });

    getDocs.mockRejectedValueOnce(err);
    await expect(updateProductModel("1", { title: "X" })).rejects.toMatchObject(
      { status: 500 },
    );

    getDocs.mockRejectedValueOnce(err);
    await expect(deleteProductModel("1")).rejects.toMatchObject({
      status: 500,
    });
  });
});
