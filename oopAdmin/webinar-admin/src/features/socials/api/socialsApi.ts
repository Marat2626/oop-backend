import { createApi } from "@reduxjs/toolkit/query/react";
import { Social, SocialFormData } from "../types";
import { baseQueryWithAuth } from "../../../shared/baseQuery";

const parseListResponse = <T>(response: unknown): T[] => {
  if (response && typeof response === "object" && "items" in response) {
    const items = (response as { items: unknown }).items;
    if (Array.isArray(items)) {
      return items as T[];
    }
  }
  if (Array.isArray(response)) {
    return response as T[];
  }
  return [];
};

const buildSocialBody = (
  data: SocialFormData,
  mode: "create" | "update",
): Record<string, string> => {
  const name = (data.name || "").trim();
  const url = (data.url || "").trim();
  const icon = (data.icon || "").trim();

  if (mode === "create") {
    const body: Record<string, string> = { name, url };
    if (icon) body.icon = icon;
    return body;
  }

  // PATCH: всегда шлём icon — пустая строка очищает значение
  return { name, url, icon };
};

export const socialsApi = createApi({
  reducerPath: "socialsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Social"],
  endpoints: (builder) => ({
    getSocials: builder.query<Social[], void>({
      query: () => "/public/social",
      transformResponse: (response: unknown) =>
        parseListResponse<Social>(response).map((social) => ({
          ...social,
          id: String(social.id),
        })),
      providesTags: ["Social"],
    }),
    getSocialById: builder.query<Social, string>({
      query: (id) => `/social/${id}`,
      transformResponse: (response: Social) => ({
        ...response,
        id: String(response.id),
      }),
      providesTags: (_result, _error, id) => [{ type: "Social", id }],
    }),
    createSocial: builder.mutation<Social, SocialFormData>({
      query: (data) => ({
        url: "/admin/create/social",
        method: "POST",
        body: buildSocialBody(data, "create"),
      }),
      invalidatesTags: ["Social"],
    }),
    updateSocial: builder.mutation<
      Social,
      { id: string; data: SocialFormData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/social/update/${id}`,
        method: "PATCH",
        body: buildSocialBody(data, "update"),
      }),
      invalidatesTags: ["Social"],
    }),
    deleteSocial: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/social/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Social"],
    }),
  }),
});

export const {
  useGetSocialsQuery,
  useGetSocialByIdQuery,
  useCreateSocialMutation,
  useUpdateSocialMutation,
  useDeleteSocialMutation,
} = socialsApi;
