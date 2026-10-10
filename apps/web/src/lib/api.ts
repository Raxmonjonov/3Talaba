/**
 * `VITE_API_URL` is baked at build time. When it is missing — a deploy that
 * never set it, for instance — a production build must not fall back to the
 * dev server, so the built bundle always names a real host.
 */
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://api.3talab.uz" : "http://localhost:4000");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("3talab_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      payload?.message || "Kutilmagan xatolik yuz berdi",
      response.status
    );
  }

  return response.json() as Promise<T>;
}