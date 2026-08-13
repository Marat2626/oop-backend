import { API_BASE_URL } from "../api/config.js";
import { asset } from "./asset.js";

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/uploads") || path.startsWith("uploads/")) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalized}`;
  }
  return asset(path);
}

export function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  if (trimmed.startsWith("ttps://")) {
    return `h${trimmed}`;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  return `https://${trimmed}`;
}
