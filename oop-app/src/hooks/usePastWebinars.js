import { useEffect, useState } from "react";
import { fetchPastVideos } from "../api/webinars.js";
import { mapVideoToCard } from "../utils/mapWebinar.js";

export function usePastWebinars({ limit = 4 } = {}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await fetchPastVideos();
        if (cancelled) return;

        const mapped = items.map(mapVideoToCard);
        setVideos(limit ? mapped.slice(0, limit) : mapped);
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
  }, [limit]);

  return { videos, loading, error };
}
