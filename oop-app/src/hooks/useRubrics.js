import { useEffect, useState } from "react";
import { fetchRubrics } from "../api/rubrics.js";

export function useRubrics() {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await fetchRubrics();
        if (cancelled) return;
        setRubrics(
          items.map((item) => ({
            id: String(item.id),
            name: item.name || "",
          })),
        );
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setRubrics([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { rubrics, loading, error };
}
