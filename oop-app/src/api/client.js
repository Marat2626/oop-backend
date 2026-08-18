import { API_BASE_URL } from "./config.js";

export function parseListResponse(response) {
  if (response && typeof response === "object" && "items" in response) {
    const { items } = response;
    if (Array.isArray(items)) return items;
  }
  if (Array.isArray(response)) return response;
  return [];
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API ${path}: ${response.status}`);
  }

  return response.json();
}
