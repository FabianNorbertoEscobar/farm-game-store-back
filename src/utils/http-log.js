export const getRequestIdForLog = (req) => {
  return req.requestId || "-";
};

export const getRequestUserForLog = (req) => {
  return req?.user?.sub || "anonymous";
};
