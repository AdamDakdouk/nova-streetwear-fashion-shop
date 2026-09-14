import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on :${env.port}`);
    });
  })
  .catch((err) => {
    console.error("[server] failed to start", err);
    process.exit(1);
  });
