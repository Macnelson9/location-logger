import type { ApiLocation, Category, User } from "./types";

/**
 * Client for the Goyin Locations API.
 *
 * All requests are same-origin to `/api/*`. A Next.js rewrite (see
 * `next.config.ts`) proxies that to the real backend, so the session cookie is
 * first-party, there's no CORS, and the strict `connect-src 'self'` CSP holds.
 */

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number; fieldErrors?: Record<string, string> };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
  } catch {
    return { ok: false, error: "Network error — is the API running?" };
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON or empty response; leave body null.
  }

  const record = (body ?? {}) as Record<string, unknown>;

  if (res.ok) {
    return { ok: true, data: body as T };
  }

  return {
    ok: false,
    status: res.status,
    error: typeof record.error === "string" ? record.error : "Something went wrong.",
    fieldErrors: record.errors as Record<string, string> | undefined,
  };
}

export async function login(email: string, password: string): Promise<ApiResult<User>> {
  const res = await request<{ user: User }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.ok ? { ok: true, data: res.data.user } : res;
}

export function logout(): Promise<ApiResult<unknown>> {
  return request("/logout", { method: "POST" });
}

export function getMe(): Promise<ApiResult<User>> {
  return request<User>("/me");
}

export function getCategories(): Promise<ApiResult<Category[]>> {
  return request<Category[]>("/categories");
}

export function getLocations(): Promise<ApiResult<ApiLocation[]>> {
  return request<ApiLocation[]>("/locations");
}

/** All locations from every user. Public — no auth required. */
export function getMapLocations(): Promise<ApiResult<ApiLocation[]>> {
  return request<ApiLocation[]>("/locations/map");
}

export interface NewLocation {
  name: string;
  category_id: number;
  lat: number;
  lng: number;
  address?: string;
}

export async function createLocation(input: NewLocation): Promise<ApiResult<ApiLocation>> {
  const res = await request<{ location: ApiLocation }>("/locations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.ok ? { ok: true, data: res.data.location } : res;
}

/** Partial update — send only the fields that changed. */
export async function updateLocation(
  id: number,
  changes: Partial<NewLocation>,
): Promise<ApiResult<ApiLocation>> {
  const res = await request<{ location: ApiLocation }>(`/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(changes),
  });
  return res.ok ? { ok: true, data: res.data.location } : res;
}

export function deleteLocation(id: number): Promise<ApiResult<unknown>> {
  return request(`/locations/${id}`, { method: "DELETE" });
}
