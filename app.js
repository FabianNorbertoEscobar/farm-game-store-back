import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/docs/swagger.js";
import { requestIdMiddleware } from "./src/middlewares/request-id.middleware.js";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { notFoundMiddleware } from "./src/middlewares/not-found.middleware.js";
import { authRouter } from "./src/routes/auth.routes.js";
import { productsRouter } from "./src/routes/products.routes.js";
import { appLogger } from "./src/utils/logger.js";
import {
  getRequestIdForLog,
  getRequestUserForLog,
} from "./src/utils/http-log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

morgan.token("request-id", getRequestIdForLog);
morgan.token("user", getRequestUserForLog);

app.use(requestIdMiddleware);
app.use(
  morgan(
    "[:request-id] :method :url :status :res[content-length] - :response-time ms user=:user",
    {
      stream: {
        write: (message) => appLogger.http(message.trim()),
      },
    },
  ),
);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.redirect(301, "/api-docs/");
});

app.use(express.static(path.join(__dirname, "public")));

appLogger.info("Middlewares inicializados", {
  swaggerDocsPath: "/api-docs",
  apiDocsJsonPath: "/api-docs.json",
});

app.get("/health", (req, res) => {
  return res.status(200).json({ ok: true });
});

app.get("/api-docs.json", (req, res) => {
  return res.status(200).json(swaggerSpec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCssUrl: "https://unpkg.com/swagger-ui-dist@5.32.6/swagger-ui.css",
    customJs: [
      "https://unpkg.com/swagger-ui-dist@5.32.6/swagger-ui-bundle.js",
      "https://unpkg.com/swagger-ui-dist@5.32.6/swagger-ui-standalone-preset.js",
    ],
  }),
);

app.use("/auth", authRouter);
app.use("/api/products", productsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
