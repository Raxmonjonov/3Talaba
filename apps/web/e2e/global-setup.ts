const API_BASE = "http://localhost:4000";

/** Fails the whole suite up front if the API is not running. */
export default async function globalSetup() {
  let lastProblem = "no attempt completed";

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) return;
      lastProblem = `HTTP ${response.status} from ${API_BASE}/health`;
    } catch (error) {
      lastProblem = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(
    `The API is not reachable on ${API_BASE}. Start it first with \`npm run dev:api\`. (${lastProblem})`
  );
}
