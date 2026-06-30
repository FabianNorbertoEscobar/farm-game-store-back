const LEVEL_WEIGHT = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LEVEL_COLOR = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const COLOR_RESET = "\x1b[0m";

const DEFAULT_LEVEL = "info";
const FORMAT_PRETTY = "pretty";
const FORMAT_JSON = "json";

const getLogFormat = () => {
  const envFormat = (process.env.LOG_FORMAT || "").toLowerCase();

  if (envFormat === FORMAT_PRETTY || envFormat === FORMAT_JSON) {
    return envFormat;
  }

  return process.env.NODE_ENV === "production" ? FORMAT_JSON : FORMAT_PRETTY;
};

const getLogLevel = () => {
  const envLevel = (process.env.LOG_LEVEL || DEFAULT_LEVEL).toLowerCase();
  return LEVEL_WEIGHT[envLevel] ? envLevel : DEFAULT_LEVEL;
};

const shouldLog = (level) => {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[getLogLevel()];
};

const formatMeta = (meta) => {
  if (!meta || Object.keys(meta).length === 0) {
    return "";
  }

  return ` ${JSON.stringify(meta)}`;
};

const formatPrettyLine = (timestamp, level, message, meta) => {
  const color = LEVEL_COLOR[level];
  const shouldColor =
    getLogFormat() === FORMAT_PRETTY && process.env.LOG_COLOR !== "0";
  const prefix = shouldColor
    ? `${color}[${level.toUpperCase()}]`
    : `[${level.toUpperCase()}]`;
  const suffix = shouldColor ? COLOR_RESET : "";

  return `${timestamp} ${prefix} ${message}${formatMeta(meta)}${suffix}`;
};

const formatJsonLine = (timestamp, level, message, meta) => {
  const payload = {
    timestamp,
    level,
    message,
  };

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  return JSON.stringify(payload);
};

const writeLog = (level, message, meta = {}) => {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const line =
    getLogFormat() === FORMAT_JSON
      ? formatJsonLine(timestamp, level, message, meta)
      : formatPrettyLine(timestamp, level, message, meta);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const appLogger = {
  debug: (message, meta) => writeLog("debug", message, meta),
  info: (message, meta) => writeLog("info", message, meta),
  warn: (message, meta) => writeLog("warn", message, meta),
  error: (message, meta) => writeLog("error", message, meta),
  http: (message, meta) => writeLog("info", message, meta),
};
