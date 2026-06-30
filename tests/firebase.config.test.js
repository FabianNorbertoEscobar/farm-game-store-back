import { beforeEach, describe, expect, it, vi } from "vitest";

const loadModule = async ({
  envOverrides,
  authCurrentUser = null,
  signInImpl,
}) => {
  vi.resetModules();

  const state = {
    signInCalls: 0,
    auth: { currentUser: authCurrentUser },
  };

  vi.doMock("../src/config/env.js", () => ({
    env: {
      firebaseApiKey: envOverrides.firebaseApiKey,
      firebaseAuthDomain: envOverrides.firebaseAuthDomain,
      firebaseProjectId: envOverrides.firebaseProjectId,
      firebaseStorageBucket: envOverrides.firebaseStorageBucket,
      firebaseMessagingSenderId: envOverrides.firebaseMessagingSenderId,
      firebaseAppId: envOverrides.firebaseAppId,
      firebaseAuthEmail: envOverrides.firebaseAuthEmail,
      firebaseAuthPassword: envOverrides.firebaseAuthPassword,
    },
  }));

  vi.doMock("firebase/app", () => ({
    initializeApp: vi.fn(() => ({ app: true })),
  }));

  vi.doMock("firebase/firestore", () => ({
    getFirestore: vi.fn(() => ({ db: true })),
  }));

  vi.doMock("firebase/auth", () => ({
    getAuth: vi.fn(() => state.auth),
    signInWithEmailAndPassword: vi.fn(async () => {
      state.signInCalls += 1;
      if (signInImpl) {
        return signInImpl();
      }
      return { user: { uid: "1" } };
    }),
  }));

  const mod = await import("../src/config/firebase.js");
  return { mod, state };
};

describe("firebase config", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("lanza error si firebase no configurado", async () => {
    const { mod } = await loadModule({
      envOverrides: {
        firebaseApiKey: "",
        firebaseAuthDomain: "",
        firebaseProjectId: "",
        firebaseStorageBucket: "",
        firebaseMessagingSenderId: "",
        firebaseAppId: "",
        firebaseAuthEmail: "",
        firebaseAuthPassword: "",
      },
    });

    await expect(mod.ensureFirebaseSession()).rejects.toMatchObject({
      status: 500,
    });
    expect(mod.hasFirebaseConfig).toBe(false);
  });

  it("retorna db si auth ya tiene currentUser", async () => {
    const { mod, state } = await loadModule({
      envOverrides: {
        firebaseApiKey: "k",
        firebaseAuthDomain: "d",
        firebaseProjectId: "p",
        firebaseStorageBucket: "s",
        firebaseMessagingSenderId: "m",
        firebaseAppId: "a",
        firebaseAuthEmail: "e@test.com",
        firebaseAuthPassword: "123",
      },
      authCurrentUser: { uid: "x" },
    });

    const db = await mod.ensureFirebaseSession();
    expect(db).toEqual({ db: true });
    expect(state.signInCalls).toBe(0);
  });

  it("retorna db si faltan credenciales para auth", async () => {
    const { mod, state } = await loadModule({
      envOverrides: {
        firebaseApiKey: "k",
        firebaseAuthDomain: "d",
        firebaseProjectId: "p",
        firebaseStorageBucket: "s",
        firebaseMessagingSenderId: "m",
        firebaseAppId: "a",
        firebaseAuthEmail: "",
        firebaseAuthPassword: "",
      },
    });

    const db = await mod.ensureFirebaseSession();
    expect(db).toEqual({ db: true });
    expect(state.signInCalls).toBe(0);
  });

  it("sign in exitoso usa cache de promise", async () => {
    let resolveFn;
    const deferred = new Promise((resolve) => {
      resolveFn = resolve;
    });

    const { mod, state } = await loadModule({
      envOverrides: {
        firebaseApiKey: "k",
        firebaseAuthDomain: "d",
        firebaseProjectId: "p",
        firebaseStorageBucket: "s",
        firebaseMessagingSenderId: "m",
        firebaseAppId: "a",
        firebaseAuthEmail: "e@test.com",
        firebaseAuthPassword: "123",
      },
      signInImpl: () => deferred,
    });

    const p1 = mod.ensureFirebaseSession();
    const p2 = mod.ensureFirebaseSession();
    resolveFn({ user: { uid: "1" } });

    await expect(p1).resolves.toEqual({ db: true });
    await expect(p2).resolves.toEqual({ db: true });
    expect(state.signInCalls).toBe(1);
  });

  it("ignora errores auth conocidos", async () => {
    const codes = [
      "auth/configuration-not-found",
      "auth/operation-not-allowed",
      "auth/user-not-found",
      "auth/invalid-credential",
      "auth/invalid-login-credentials",
    ];

    for (const code of codes) {
      const { mod } = await loadModule({
        envOverrides: {
          firebaseApiKey: "k",
          firebaseAuthDomain: "d",
          firebaseProjectId: "p",
          firebaseStorageBucket: "s",
          firebaseMessagingSenderId: "m",
          firebaseAppId: "a",
          firebaseAuthEmail: "e@test.com",
          firebaseAuthPassword: "123",
        },
        signInImpl: async () => {
          const error = new Error(code);
          error.code = code;
          throw error;
        },
      });

      await expect(mod.ensureFirebaseSession()).resolves.toEqual({ db: true });
    }
  });

  it("propaga error auth desconocido", async () => {
    const { mod } = await loadModule({
      envOverrides: {
        firebaseApiKey: "k",
        firebaseAuthDomain: "d",
        firebaseProjectId: "p",
        firebaseStorageBucket: "s",
        firebaseMessagingSenderId: "m",
        firebaseAppId: "a",
        firebaseAuthEmail: "e@test.com",
        firebaseAuthPassword: "123",
      },
      signInImpl: async () => {
        const error = new Error("unknown");
        error.code = "auth/internal-error";
        throw error;
      },
    });

    await expect(mod.ensureFirebaseSession()).rejects.toThrow("unknown");
  });
});
