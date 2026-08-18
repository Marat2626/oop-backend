import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginCredentials, LoginResponse } from "../types/types";
import { API_BASE_URL } from "../../shared/baseQuery";

function extractToken(response: unknown): string | null {
  if (typeof response === "string" && response.trim()) {
    return response.trim();
  }

  if (!response || typeof response !== "object") return null;

  const data = response as Record<string, unknown>;
  const candidates = [data.token, data.access_token, data.accessToken];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/admin/user",
        method: "POST",
        body: {
          username: credentials.username.trim(),
          password: credentials.password,
        },
        // Бэкенд при неверном пароле отдаёт 200 + { error }, без token
        validateStatus: (response, body) =>
          response.status === 200 && Boolean(extractToken(body)),
      }),
      transformResponse: (response: unknown): LoginResponse => {
        const token = extractToken(response);
        if (!token) {
          throw new Error("Токен отсутствует в ответе");
        }
        return { token };
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
