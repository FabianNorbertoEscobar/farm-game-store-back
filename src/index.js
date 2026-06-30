import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { productsRouter } from "./routes/products.routes.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/health", (req, res) => {
  return res.status(200).json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/api/products", productsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`API corriendo en http://localhost:${env.port}`);
});
