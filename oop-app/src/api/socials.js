import { apiGet, parseListResponse } from "./client.js";

export async function fetchSocials() {
  const response = await apiGet("/public/social");
  return parseListResponse(response);
}

export async function fetchSocialById(id) {
  return apiGet(`/social/${id}`);
}
