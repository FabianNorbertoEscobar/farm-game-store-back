import {
  createProductModel,
  deleteProductModel,
  getAllProductsModel,
  getProductByIdModel,
  updateProductModel,
} from "../models/products.model.js";

const normalizeProductPayload = (
  payload,
  { requireAllFields, allowId = false },
) => {
  const normalizedPayload = {};

  if (payload.title !== undefined) {
    if (!payload.title) {
      const error = new Error("title no puede estar vacio");
      error.status = 400;
      throw error;
    }

    normalizedPayload.title = payload.title;
  }

  if (payload.category !== undefined) {
    if (!payload.category) {
      const error = new Error("category no puede estar vacio");
      error.status = 400;
      throw error;
    }

    normalizedPayload.category = payload.category;
  }

  if (payload.price !== undefined) {
    const normalizedPrice = Number(payload.price);

    if (!Number.isInteger(normalizedPrice) || normalizedPrice < 0) {
      const error = new Error(
        "price debe ser un numero entero mayor o igual a 0",
      );
      error.status = 400;
      throw error;
    }

    normalizedPayload.price = normalizedPrice;
  }

  if (payload.img !== undefined) {
    if (typeof payload.img !== "string") {
      const error = new Error("img debe ser un string");
      error.status = 400;
      throw error;
    }

    normalizedPayload.img = payload.img;
  }

  if (payload.id !== undefined && !allowId) {
    const error = new Error("id no puede modificarse");
    error.status = 400;
    throw error;
  }

  if (requireAllFields) {
    const requiredFields = ["title", "price", "category"];
    const missingField = requiredFields.find(
      (fieldName) => normalizedPayload[fieldName] === undefined,
    );

    if (missingField) {
      const error = new Error("title, price y category son obligatorios");
      error.status = 400;
      throw error;
    }
  }

  return normalizedPayload;
};

export const getAllProductsService = async () => {
  return getAllProductsModel();
};

export const getProductByIdService = async (id) => {
  return getProductByIdModel(id);
};

export const createProductService = async (payload) => {
  const normalizedPayload = normalizeProductPayload(payload, {
    requireAllFields: true,
    allowId: true,
  });

  if (
    payload.id !== undefined &&
    (!Number.isInteger(Number(payload.id)) || Number(payload.id) <= 0)
  ) {
    const error = new Error("id debe ser un numero entero positivo");
    error.status = 400;
    throw error;
  }

  return createProductModel({
    id: payload.id === undefined ? undefined : Number(payload.id),
    title: normalizedPayload.title,
    price: normalizedPayload.price,
    category: normalizedPayload.category,
    img: normalizedPayload.img || "",
  });
};

export const replaceProductService = async (id, payload) => {
  const normalizedPayload = normalizeProductPayload(payload, {
    requireAllFields: true,
  });

  return updateProductModel(id, {
    title: normalizedPayload.title,
    category: normalizedPayload.category,
    price: normalizedPayload.price,
    img: normalizedPayload.img || "",
  });
};

export const patchProductService = async (id, payload) => {
  const normalizedPayload = normalizeProductPayload(payload, {
    requireAllFields: false,
  });

  if (Object.keys(normalizedPayload).length === 0) {
    const error = new Error("Debes enviar al menos un campo para actualizar");
    error.status = 400;
    throw error;
  }

  return updateProductModel(id, normalizedPayload);
};

export const deleteProductService = async (id) => {
  return deleteProductModel(id);
};
