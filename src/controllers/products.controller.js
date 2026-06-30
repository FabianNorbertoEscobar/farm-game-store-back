import {
  createProductService,
  deleteProductService,
  getAllProductsService,
  patchProductService,
  getProductByIdService,
  replaceProductService,
} from "../services/products.service.js";

export const getAllProductsController = async (req, res, next) => {
  try {
    const data = await getAllProductsService();
    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getProductByIdController = async (req, res, next) => {
  try {
    const data = await getProductByIdService(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const createProductController = async (req, res, next) => {
  try {
    const data = await createProductService(req.body);
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
};

export const replaceProductController = async (req, res, next) => {
  try {
    const data = await replaceProductService(req.params.id, req.body);

    if (!data) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const patchProductController = async (req, res, next) => {
  try {
    const data = await patchProductService(req.params.id, req.body);

    if (!data) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const data = await deleteProductService(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res
      .status(200)
      .json({ message: "Producto eliminado", product: data });
  } catch (error) {
    return next(error);
  }
};
