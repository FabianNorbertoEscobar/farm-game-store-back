import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  patchProductController,
  replaceProductController,
} from "../controllers/products.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const productsRouter = Router();

productsRouter.get("/", authMiddleware, getAllProductsController);
productsRouter.get("/:id", authMiddleware, getProductByIdController);
productsRouter.post("/create", authMiddleware, createProductController);
productsRouter.put("/:id", authMiddleware, replaceProductController);
productsRouter.patch("/:id", authMiddleware, patchProductController);
productsRouter.delete("/:id", authMiddleware, deleteProductController);

export { productsRouter };
