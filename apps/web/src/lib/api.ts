const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export type ApiUser = { id: string; email: string; name: string; role: "USER" | "ADMIN" };
export type InvitationStatus = "DRAFT" | "UNPAID" | "PUBLISHED" | "ARCHIVED";
export type ApiInvitation = {
  id: string;
  slug: string;
  title: string;
  status: InvitationStatus;
  calculatedPrice: number | string;
  publishedAt: string | null;
  updatedAt: string;
  template?: { slug: string } | null;
  _count?: { rsvps: number };
};

type RequestOptions = Omit<RequestInit, "headers"> & { auth?: boolean; headers?: HeadersInit };

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("ucapin-access-token");
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem("ucapin-user");
  if (!value) return null;
  try {
    return JSON.parse(value) as ApiUser;
  } catch {
    window.localStorage.removeItem("ucapin-user");
    return null;
  }
}

export function storeSession(accessToken: string, user: ApiUser) {
  window.localStorage.setItem("ucapin-access-token", accessToken);
  window.localStorage.setItem("ucapin-user", JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem("ucapin-access-token");
  window.localStorage.removeItem("ucapin-user");
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (options.auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      cache: "no-store",
      signal: options.signal ?? AbortSignal.timeout(15_000),
    });
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "TimeoutError") {
      throw new ApiError("Server terlalu lama merespons. Coba lagi.", 408);
    }
    throw new ApiError("Tidak dapat terhubung ke server. Pastikan API berjalan di port 4000.", 0);
  }

  const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    if (response.status === 401 && options.auth) clearSession();
    throw new ApiError(message ?? `Permintaan gagal (${response.status}).`, response.status);
  }
  return body as T;
}
