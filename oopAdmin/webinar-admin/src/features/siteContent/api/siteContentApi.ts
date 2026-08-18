import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../../shared/baseQuery";
import { DEFAULT_SITE_CONTENT, SiteContent } from "../types";

const mergeSiteContent = (raw: unknown): SiteContent => {
  if (!raw || typeof raw !== "object") return DEFAULT_SITE_CONTENT;
  const data = raw as Partial<SiteContent>;
  return {
    brand: { ...DEFAULT_SITE_CONTENT.brand, ...(data.brand || {}) },
    nav: { ...DEFAULT_SITE_CONTENT.nav, ...(data.nav || {}) },
    home_hero: { ...DEFAULT_SITE_CONTENT.home_hero, ...(data.home_hero || {}) },
    home_webinar: {
      ...DEFAULT_SITE_CONTENT.home_webinar,
      ...(data.home_webinar || {}),
      featured_past_webinar_id:
        data.home_webinar?.featured_past_webinar_id ??
        DEFAULT_SITE_CONTENT.home_webinar.featured_past_webinar_id,
    },
    about: { ...DEFAULT_SITE_CONTENT.about, ...(data.about || {}) },
    stats: { ...DEFAULT_SITE_CONTENT.stats, ...(data.stats || {}) },
  };
};

export const siteContentApi = createApi({
  reducerPath: "siteContentApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["SiteContent"],
  endpoints: (builder) => ({
    getSiteContent: builder.query<SiteContent, void>({
      query: () => "/public/site-content",
      transformResponse: (response: unknown) => mergeSiteContent(response),
      providesTags: ["SiteContent"],
    }),
    updateSiteContent: builder.mutation<SiteContent, SiteContent>({
      query: (body) => ({
        url: "/admin/site-content",
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => mergeSiteContent(response),
      invalidatesTags: ["SiteContent"],
    }),
  }),
});

export const { useGetSiteContentQuery, useUpdateSiteContentMutation } =
  siteContentApi;
