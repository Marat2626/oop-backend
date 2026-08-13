import { apiGet } from "./client.js";
import { mergeSiteContent } from "../constants/siteContent.js";

export async function fetchSiteContent() {
  const response = await apiGet("/public/site-content");
  return mergeSiteContent(response);
}
