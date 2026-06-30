import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const requireEnv = (name, fallback) => {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(`Falta variable de entorno requerida: ${name}`);
  }

  return fallback;
};

export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: requireEnv("JWT_SECRET", "change_this_secret"),
  authUserEmail: requireEnv("AUTH_USER_EMAIL", "admin@farmgamestore.com"),
  authUserPassword: requireEnv("AUTH_USER_PASSWORD", "123456"),
  firebaseAuthEmail:
    process.env.FIREBASE_AUTH_EMAIL || process.env.AUTH_USER_EMAIL,
  firebaseAuthPassword:
    process.env.FIREBASE_AUTH_PASSWORD || process.env.AUTH_USER_PASSWORD,
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  firebaseAppId: process.env.FIREBASE_APP_ID,
  firebaseProductsCollection:
    process.env.FIREBASE_PRODUCTS_COLLECTION || "products-test",
};
