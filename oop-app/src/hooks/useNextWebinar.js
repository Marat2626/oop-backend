import { useEffect, useState } from "react";
import { fetchNextWebinar } from "../api/webinars.js";
import { mapNextWebinar } from "../utils/mapWebinar.js";

export function useNextWebinar() {
  const [webinar, setWebinar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchNextWebinar();
        if (cancelled) return;
        setWebinar(mapNextWebinar(data));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setWebinar(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { webinar, loading, error };
}
