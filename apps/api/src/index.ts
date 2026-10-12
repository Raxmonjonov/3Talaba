import { app } from "./app.js";
import { validateEnv } from "./config/env.js";

validateEnv();

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`3Talab API: http://localhost:${PORT}`);
});
