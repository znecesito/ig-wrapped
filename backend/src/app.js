import express from "express";
import cors from "cors";
import uploadRouter from "./routes/upload.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/", uploadRouter);
app.use(errorHandler);

export default app;
