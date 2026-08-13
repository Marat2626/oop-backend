import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

/** Меняй только через .env → REACT_APP_API_URL */
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

type AuthSlice = {
  auth?: {
    token?: string | null;
  };
};

/** Отсекает null/undefined и строки "undefined"/"null" из localStorage. */
export function isValidToken(token: unknown): token is string {
  if (typeof token !== "string") return false;
  const value = token.trim();
  return value.length > 0 && value !== "undefined" && value !== "null";
}

export function readStoredToken(): string | null {
  const raw = localStorage.getItem("token");
  if (!isValidToken(raw)) {
    if (raw != null) localStorage.removeItem("token");
    return null;
  }
  return raw.trim();
}

export function getAuthToken(getState?: () => unknown): string | null {
  if (getState) {
    const state = getState() as AuthSlice;
    const fromState = state.auth?.token;
    if (isValidToken(fromState)) return fromState.trim();
  }

  return readStoredToken();
}

export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/uploads") || path.startsWith("uploads/")) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalized}`;
  }
  return path;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getAuthToken(getState);
    if (isValidToken(token)) {
      headers.set("token", token.trim());
    } else {
      headers.delete("token");
    }
    return headers;
  },
});

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const token = getAuthToken(api.getState);

  let adjustedArgs: string | FetchArgs = args;

  if (typeof args !== "string") {
    const headers: Record<string, string> = {};

    if (args.headers && typeof args.headers === "object") {
      const entries =
        args.headers instanceof Headers
          ? Array.from(args.headers.entries())
          : Object.entries(args.headers as Record<string, unknown>);

      for (const [key, value] of entries) {
        if (typeof value === "string" && value !== "undefined") {
          headers[key] = value;
        }
      }
    }

    if (isValidToken(token)) {
      headers.token = token.trim();
    } else {
      delete headers.token;
    }

    adjustedArgs = {
      ...args,
      headers,
    };
  }

  return rawBaseQuery(adjustedArgs, api, extraOptions);
};
