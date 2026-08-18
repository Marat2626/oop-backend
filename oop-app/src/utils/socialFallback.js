import { asset } from "./asset.js";

const ICON_BY_NAME = {
  vk: "/vk.svg",
  "vk видео": "/vk.svg",
  rutube: "/rutube.svg",
  дзен: "/dzen.svg",
  zen: "/dzen.svg",
  telegram: "/un.svg",
  клип: "/clip.svg",
  tenchat: "/th.svg",
  max: "/max.svg",
};

export function getSocialFallbackIcon(name) {
  const key = (name || "").trim().toLowerCase();
  const path = ICON_BY_NAME[key];
  return path ? asset(path) : "";
}
