import express from "express";
import cors from "cors";
import { env } from "./config/env";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());

app.use("/api", apiRouter);

app.use(errorHandler);
