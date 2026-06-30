import { describe, expect, it, vi } from "vitest";

describe("products.model sin firebase config", () => {
  it("lanza 500 cuando no hay configuracion firebase", async () => {
    vi.resetModules();

    vi.doMock("../src/config/env.js", () => ({
      env: { firebaseProductsCollection: "products-test" },
    }));

    vi.doMock("../src/config/firebase.js", () => ({
      db: null,
      hasFirebaseConfig: false,
      ensureFirebaseSession: vi.fn(),
    }));

    vi.doMock("firebase/firestore", () => ({
      addDoc: vi.fn(),
      collection: vi.fn(),
      deleteDoc: vi.fn(),
      doc: vi.fn(),
      getDoc: vi.fn(),
      getDocs: vi.fn(),
      limit: vi.fn(),
      orderBy: vi.fn(),
      query: vi.fn(),
      runTransaction: vi.fn(),
      serverTimestamp: vi.fn(),
      setDoc: vi.fn(),
      updateDoc: vi.fn(),
      where: vi.fn(),
    }));

    const { getAllProductsModel } =
      await import("../src/models/products.model.js");

    await expect(getAllProductsModel()).rejects.toMatchObject({
      status: 500,
      message: "Firebase no esta configurado. Revisa tu archivo .env",
    });
  });
});
