import { useEffect, useState } from "react";
import { fetchExperts } from "../api/experts.js";
import { mapExpertToCard } from "../utils/mapExpert.js";

export function useExperts() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await fetchExperts();
        if (cancelled) return;

        setExperts(items.map(mapExpertToCard));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setExperts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { experts, loading, error };
}
