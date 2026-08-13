import { apiGet, parseListResponse } from "./client.js";

export async function fetchRubrics() {
  const response = await apiGet("/public/rubrics");
  return parseListResponse(response);
}
