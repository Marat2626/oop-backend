import { useEffect, useMemo, useState } from "react";
import { fetchPastVideos, fetchPublicWebinars } from "../api/webinars.js";
import { mapVideoToArchiveCard } from "../utils/mapWebinar.js";

function isPastWebinar(webinar) {
  const end = webinar.end_time || webinar.start_time;
  if (!end) return true;
  const date = new Date(end);
  if (!Number.isFinite(date.getTime())) return true;
  return date.getTime() <= Date.now();
}

async function fetchAllPublicWebinars(params = {}) {
  const byId = new Map();
  let page = 1;

  while (page <= 40) {
    const items = await fetchPublicWebinars({
      ...params,
      page,
      limit: 50,
    });
    items.forEach((item) => {
      if (item?.id != null) byId.set(item.id, item);
    });
    if (items.length < 50) break;
    page += 1;
  }

  return Array.from(byId.values());
}

export function useArchiveWebinars({ search = "", rubricId = null } = {}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        let items;
        if (rubricId) {
          items = await fetchAllPublicWebinars({ rubric_id: rubricId });
          items = items.filter(isPastWebinar);
        } else {
          items = await fetchPastVideos();
        }

        if (cancelled) return;
        setVideos(items.map(mapVideoToArchiveCard));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setVideos([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [rubricId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return videos;
    return videos.filter((item) =>
      (item.title || "").toLowerCase().includes(query),
    );
  }, [videos, search]);

  return { videos: filtered, loading, error };
}
