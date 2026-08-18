import { apiGet, parseListResponse } from "./client.js";

export async function fetchExperts() {
  const response = await apiGet("/admin/expert/all");
  return parseListResponse(response);
}

export async function fetchExpertById(id) {
  return apiGet(`/admin/expert/${id}`);
}
