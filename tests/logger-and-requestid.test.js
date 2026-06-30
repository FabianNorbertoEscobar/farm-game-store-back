import { beforeEach, describe, expect, it, vi } from "vitest";
import { appLogger } from "../src/utils/logger.js";
import { requestIdMiddleware } from "../src/middlewares/request-id.middleware.js";
import {
  getRequestIdForLog,
  getRequestUserForLog,
} from "../src/utils/http-log.js";

describe("logger y request-id", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.LOG_LEVEL = "info";
    process.env.NODE_ENV = "test";
    delete process.env.LOG_FORMAT;
    delete process.env.LOG_COLOR;
  });

  it("logger.info imprime con meta", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.info("mensaje", { a: 1 });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = String(logSpy.mock.calls[0][0]);
    expect(line).toContain("[INFO] mensaje");
    expect(line).toContain('"a":1');
  });

  it("logger.warn usa console.warn", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    appLogger.warn("warning", {});

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(String(warnSpy.mock.calls[0][0])).toContain("[WARN] warning");
  });

  it("logger.error usa console.error", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    appLogger.error("error");

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(String(errorSpy.mock.calls[0][0])).toContain("[ERROR] error");
  });

  it("logger.debug no imprime con LOG_LEVEL=info", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.debug("debug");

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("logger.debug imprime con LOG_LEVEL=debug", () => {
    process.env.LOG_LEVEL = "debug";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.debug("debug");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(String(logSpy.mock.calls[0][0])).toContain("[DEBUG] debug");
  });

  it("logger.http usa nivel info", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.http("request");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(String(logSpy.mock.calls[0][0])).toContain("[INFO] request");
  });

  it("logger cae a info cuando LOG_LEVEL es invalido", () => {
    process.env.LOG_LEVEL = "nivel-raro";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.info("fallback");

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(String(logSpy.mock.calls[0][0])).toContain("[INFO] fallback");
  });

  it("logger usa formato json por defecto en produccion", () => {
    process.env.NODE_ENV = "production";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.info("json-prod", { requestId: "r-1" });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
    expect(payload.level).toBe("info");
    expect(payload.message).toBe("json-prod");
    expect(payload.meta.requestId).toBe("r-1");
  });

  it("logger permite forzar formato json via LOG_FORMAT", () => {
    process.env.NODE_ENV = "test";
    process.env.LOG_FORMAT = "json";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    appLogger.warn("json-override", { x: 1 });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(warnSpy.mock.calls[0][0]));
    expect(payload.level).toBe("warn");
    expect(payload.meta.x).toBe(1);
  });

  it("logger json no incluye meta cuando no se envia", () => {
    process.env.NODE_ENV = "production";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.info("sin-meta");

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
    expect(payload.message).toBe("sin-meta");
    expect(payload.meta).toBeUndefined();
  });

  it("logger ignora LOG_FORMAT invalido y cae a pretty en no-prod", () => {
    process.env.NODE_ENV = "test";
    process.env.LOG_FORMAT = "raro";
    process.env.LOG_COLOR = "0";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    appLogger.info("pretty-fallback");

    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = String(logSpy.mock.calls[0][0]);
    expect(line).toContain("[INFO] pretty-fallback");
  });

  it("requestIdMiddleware setea requestId y header", () => {
    const req = {};
    const res = { setHeader: vi.fn() };
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(typeof req.requestId).toBe("string");
    expect(req.requestId.length).toBeGreaterThan(0);
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it("getRequestUserForLog devuelve sub cuando existe", () => {
    const req = { user: { sub: "admin@test.com" } };

    expect(getRequestUserForLog(req)).toBe("admin@test.com");
  });

  it("getRequestUserForLog devuelve anonymous sin user/sub", () => {
    expect(getRequestUserForLog({})).toBe("anonymous");
    expect(getRequestUserForLog({ user: {} })).toBe("anonymous");
  });

  it("getRequestIdForLog devuelve requestId cuando existe", () => {
    expect(getRequestIdForLog({ requestId: "abc-123" })).toBe("abc-123");
  });

  it("getRequestIdForLog devuelve guion cuando falta requestId", () => {
    expect(getRequestIdForLog({})).toBe("-");
  });
});
