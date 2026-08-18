import { apiGet, parseListResponse } from "./client.js";

export async function fetchPastVideos() {
  const response = await apiGet("/public/videos");
  return parseListResponse(response);
}

export async function fetchNextWebinar() {
  const response = await apiGet("/public/next-webinar");
  if (!response || typeof response !== "object") return null;
  if (response.id == null && !response.title) return null;
  return response;
}

export async function fetchPublicWebinars(params = {}) {
  const search = new URLSearchParams();
  if (params.rubric_id != null) search.set("rubric_id", String(params.rubric_id));
  if (params.search) search.set("search", params.search);
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));

  const query = search.toString();
  const response = await apiGet(
    `/public/webinars${query ? `?${query}` : ""}`,
  );
  return parseListResponse(response);
}
