import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  db,
  ensureFirebaseSession,
  hasFirebaseConfig,
} from "../config/firebase.js";
import { env } from "../config/env.js";

const COLLECTION_NAME = env.firebaseProductsCollection;

const ensureFirestore = () => {
  if (!hasFirebaseConfig || !db) {
    const error = new Error(
      "Firebase no esta configurado. Revisa tu archivo .env",
    );
    error.status = 500;
    throw error;
  }
};

const parseFirestoreError = (error) => {
  if (error?.code === "permission-denied") {
    const mappedError = new Error(
      "Firestore rechazo la operacion. Verifica reglas de seguridad o credenciales de Firebase Auth.",
    );
    mappedError.status = 500;
    return mappedError;
  }

  return error;
};

const getProductsCollection = async () => {
  ensureFirestore();
  await ensureFirebaseSession();
  return collection(db, COLLECTION_NAME);
};

const mapProduct = (snapshot) => ({
  id: snapshot.data().id,
  title: snapshot.data().title,
  category: snapshot.data().category,
  img: snapshot.data().img || "",
  price: snapshot.data().price,
});

const getProductSnapshotByNumericId = async (id) => {
  const numericId = Number(id);
  const productsCollection = await getProductsCollection();
  const productQuery = query(
    productsCollection,
    where("id", "==", numericId),
    limit(1),
  );
  const snapshot = await getDocs(productQuery);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0];
};

const getNextProductId = async () => {
  const productsCollection = await getProductsCollection();
  const lastProductQuery = query(
    productsCollection,
    orderBy("id", "desc"),
    limit(1),
  );
  const snapshot = await getDocs(lastProductQuery);

  if (snapshot.empty) {
    return 1;
  }

  return Number(snapshot.docs[0].data().id) + 1;
};

export const getAllProductsModel = async () => {
  try {
    const productsCollection = await getProductsCollection();
    const productsQuery = query(productsCollection, orderBy("id", "asc"));
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map(mapProduct);
  } catch (error) {
    throw parseFirestoreError(error);
  }
};

export const getProductByIdModel = async (id) => {
  try {
    const productSnapshot = await getProductSnapshotByNumericId(id);

    if (!productSnapshot) {
      return null;
    }

    return mapProduct(productSnapshot);
  } catch (error) {
    throw parseFirestoreError(error);
  }
};

export const createProductModel = async (payload) => {
  try {
    const productsCollection = await getProductsCollection();
    const nextId = payload.id ?? (await getNextProductId());
    const productToCreate = {
      id: nextId,
      title: payload.title,
      category: payload.category,
      img: payload.img || "",
      price: payload.price,
      createdAt: serverTimestamp(),
    };

    const existingProduct = await getProductSnapshotByNumericId(nextId);

    if (existingProduct) {
      const error = new Error("Ya existe un producto con ese id");
      error.status = 400;
      throw error;
    }

    await addDoc(productsCollection, productToCreate);

    return {
      id: productToCreate.id,
      title: productToCreate.title,
      category: productToCreate.category,
      img: productToCreate.img,
      price: productToCreate.price,
    };
  } catch (error) {
    throw parseFirestoreError(error);
  }
};

export const updateProductModel = async (id, payload) => {
  try {
    const productSnapshot = await getProductSnapshotByNumericId(id);

    if (!productSnapshot) {
      return null;
    }

    await updateDoc(doc(db, COLLECTION_NAME, productSnapshot.id), payload);

    return {
      ...mapProduct(productSnapshot),
      ...payload,
    };
  } catch (error) {
    throw parseFirestoreError(error);
  }
};

export const deleteProductModel = async (id) => {
  try {
    const productSnapshot = await getProductSnapshotByNumericId(id);

    if (!productSnapshot) {
      return null;
    }

    const product = mapProduct(productSnapshot);
    await deleteDoc(doc(db, COLLECTION_NAME, productSnapshot.id));
    return product;
  } catch (error) {
    throw parseFirestoreError(error);
  }
};
