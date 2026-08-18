import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchSiteContent } from "../api/siteContent.js";
import { DEFAULT_SITE_CONTENT } from "../constants/siteContent.js";
import { asset } from "../utils/asset.js";
import { mediaUrl } from "../utils/mediaUrl.js";

const SiteContentContext = createContext({
  content: DEFAULT_SITE_CONTENT,
  loading: true,
  error: null,
  logoPrimary: asset("/logo.svg"),
  logoSecondary: asset("/logo1.svg"),
  navLinks: [
    { to: "/", label: DEFAULT_SITE_CONTENT.nav.home },
    { to: "/calendar", label: DEFAULT_SITE_CONTENT.nav.calendar },
    { to: "/webinars", label: DEFAULT_SITE_CONTENT.nav.webinars },
    { to: "/experts", label: DEFAULT_SITE_CONTENT.nav.experts },
    { to: "/about", label: DEFAULT_SITE_CONTENT.nav.about },
  ],
});

function resolveLogo(url, fallbackPath) {
  if (!url || !String(url).trim()) return asset(fallbackPath);
  return mediaUrl(url);
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchSiteContent();
        if (cancelled) return;
        setContent(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setContent(DEFAULT_SITE_CONTENT);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const nav = content.nav || DEFAULT_SITE_CONTENT.nav;
    // Первый логотип (университет) всегда дефолтный — с бэка не подменяем.
    // Если пришла одна картинка (logo_url или logo_secondary_url) — меняем только второй.
    const secondaryFromApi =
      content.brand?.logo_secondary_url || content.brand?.logo_url || "";

    return {
      content,
      loading,
      error,
      logoPrimary: asset("/logo.svg"),
      logoSecondary: resolveLogo(secondaryFromApi, "/logo1.svg"),
      navLinks: [
        { to: "/", label: nav.home },
        { to: "/calendar", label: nav.calendar },
        { to: "/webinars", label: nav.webinars },
        { to: "/experts", label: nav.experts },
        { to: "/about", label: nav.about },
      ],
    };
  }, [content, loading, error]);

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
