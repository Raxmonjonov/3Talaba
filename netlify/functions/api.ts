import serverless from "serverless-http";
import { app } from "../../apps/api/src/app.js";

export const handler = serverless(app, {
  request: (req: any) => {
    // Netlify rewrites /api/* → /.netlify/functions/api/:splat.
    // Restore the original /api/... prefix so Express routers match.
    req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "/api") || "/api";
  },
});
