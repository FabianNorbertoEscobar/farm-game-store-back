import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env } from "./env.js";

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let db = null;
let auth = null;
let firebaseSessionPromise = null;

if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

const ensureFirebaseSession = async () => {
  if (!hasFirebaseConfig || !db || !auth) {
    const error = new Error(
      "Firebase no esta configurado. Revisa tu archivo .env",
    );
    error.status = 500;
    throw error;
  }

  if (auth.currentUser) {
    return db;
  }

  if (!env.firebaseAuthEmail || !env.firebaseAuthPassword) {
    return db;
  }

  if (!firebaseSessionPromise) {
    firebaseSessionPromise = signInWithEmailAndPassword(
      auth,
      env.firebaseAuthEmail,
      env.firebaseAuthPassword,
    ).catch((error) => {
      firebaseSessionPromise = null;

      if (
        error?.code === "auth/configuration-not-found" ||
        error?.code === "auth/operation-not-allowed" ||
        error?.code === "auth/user-not-found" ||
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/invalid-login-credentials"
      ) {
        return null;
      }

      throw error;
    });
  }

  await firebaseSessionPromise;
  return db;
};

export { db, ensureFirebaseSession, hasFirebaseConfig };
