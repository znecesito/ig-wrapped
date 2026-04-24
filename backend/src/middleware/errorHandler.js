export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const message = error?.message || "Something went wrong while processing files.";
  const isClientError =
    message.includes("Invalid JSON") || message.includes("Unexpected");

  res.status(isClientError ? 400 : 500).json({ error: message });
}
