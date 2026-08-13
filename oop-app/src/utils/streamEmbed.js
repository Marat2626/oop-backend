/**
 * Достаёт URL из обычной ссылки или из HTML <iframe src="...">.
 */
function extractRawUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const iframeSrc = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (iframeSrc?.[1]) return iframeSrc[1].trim();

  return trimmed;
}

function withParams(urlString, params) {
  try {
    const u = new URL(urlString);
    Object.entries(params).forEach(([key, value]) => {
      if (value == null || value === "") return;
      if (!u.searchParams.has(key)) u.searchParams.set(key, String(value));
    });
    return u.toString();
  } catch {
    return urlString;
  }
}

function isVkHost(host) {
  return (
    host.includes("vk.com") ||
    host.includes("vk.ru") ||
    host.includes("vkvideo.ru")
  );
}

/**
 * Преобразует URL VK / OK (или код iframe) в embed-URL для iframe-плеера.
 * Возвращает null, если формат не распознан.
 */
export function toStreamEmbedUrl(rawInput) {
  const raw = extractRawUrl(rawInput);
  if (!raw) return null;

  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname;

    // Уже embed VK (vk.com, vk.ru, vkvideo.ru)
    if (
      isVkHost(host) &&
      (path.includes("video_ext.php") || path.includes("/video_ext"))
    ) {
      // Нормализуем vk.ru → vk.com для iframe (одинаковый embed)
      const embedUrl = parsed.toString().replace(/\/\/vk\.ru\//i, "//vk.com/");
      return withParams(embedUrl, { hd: "2", autoplay: "1" });
    }

    // Уже embed OK
    if (host.includes("ok.ru") && path.includes("videoembed")) {
      return withParams(parsed.toString(), { autoplay: "1" });
    }

    // VK / vkvideo: video-123_456, video123_456, clip-123_456
    if (
      isVkHost(host) ||
      host === "m.vk.com" ||
      host === "live.vkvideo.ru"
    ) {
      const match = path.match(/\/(?:video|clip)(-?\d+)_(\d+)/i);
      if (match) {
        const oid = match[1];
        const id = match[2];
        const hash = parsed.searchParams.get("hash") || "";
        const embed = new URL("https://vk.com/video_ext.php");
        embed.searchParams.set("oid", oid);
        embed.searchParams.set("id", id);
        embed.searchParams.set("hd", "2");
        embed.searchParams.set("autoplay", "1");
        if (hash) embed.searchParams.set("hash", hash);
        return embed.toString();
      }

      const z = parsed.searchParams.get("z");
      if (z) {
        const zMatch = decodeURIComponent(z).match(
          /(?:video|clip)(-?\d+)_(\d+)/i,
        );
        if (zMatch) {
          const embed = new URL("https://vk.com/video_ext.php");
          embed.searchParams.set("oid", zMatch[1]);
          embed.searchParams.set("id", zMatch[2]);
          embed.searchParams.set("hd", "2");
          embed.searchParams.set("autoplay", "1");
          return embed.toString();
        }
      }
    }

    // Одноклассники
    if (host === "ok.ru" || host === "m.ok.ru") {
      const embedMatch = path.match(/\/videoembed\/(\d+)/i);
      if (embedMatch) {
        return withParams(
          `https://ok.ru/videoembed/${embedMatch[1]}`,
          { autoplay: "1" },
        );
      }
      const videoMatch = path.match(/\/(?:video|live)\/(\d+)/i);
      if (videoMatch) {
        return withParams(
          `https://ok.ru/videoembed/${videoMatch[1]}`,
          { autoplay: "1" },
        );
      }
    }

    return null;
  } catch {
    return null;
  }
}
