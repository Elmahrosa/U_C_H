app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "U_C_H Enterprise API",
    timestamp: new Date().toISOString(),
  });
});
