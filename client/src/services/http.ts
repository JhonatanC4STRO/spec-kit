const BASE_URL: string = "/api";

export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function httpGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response: Response = await fetch(`${BASE_URL}${path}`, { headers });
  return parseResponse<T>(response);
}

export async function httpDelete<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response: Response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  return parseResponse<T>(response);
}

export async function httpPost<T>(
  path: string,
  payload: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response: Response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return parseResponse<T>(response);
}

export async function httpPatch<T>(
  path: string,
  payload: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response: Response = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch((): null => null);
  if (!response.ok) {
    const message: string =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : `Error HTTP ${response.status}`;
    throw new HttpError(response.status, message, body);
  }
  return body as T;
}
