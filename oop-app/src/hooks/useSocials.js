import { useEffect, useState } from "react";
import { fetchSocials } from "../api/socials.js";
import { mediaUrl, normalizeUrl } from "../utils/mediaUrl.js";

function mapSocialToCard(social) {
  return {
    id: social.id,
    name: social.name || "",
    url: normalizeUrl(social.url),
    icon: mediaUrl(social.icon),
  };
}

export function useSocials() {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const items = await fetchSocials();
        if (cancelled) return;

        setSocials(items.map(mapSocialToCard));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setSocials([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { socials, loading, error };
}
