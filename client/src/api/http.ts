const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  path: string,
  options?: { method?: HttpMethod; body?: unknown; token?: string | null },
): Promise<T> {
  const method = options?.method ?? "GET";
  const token = options?.token ?? null;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!res.ok) {
    const message =
      (typeof payload?.error === "string" && payload.error) ||
      payload?.error?.message ||
      payload?.message ||
      payload?.error ||
      "Request failed";

    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}
