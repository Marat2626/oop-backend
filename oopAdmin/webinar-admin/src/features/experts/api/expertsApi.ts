import { createApi } from "@reduxjs/toolkit/query/react";
import { Expert, ExpertFormData } from "../types";
import { baseQueryWithAuth } from "../../../shared/baseQuery";

interface UploadPhotoResponse {
  url: string;
}

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

const buildExpertBody = (
  data: ExpertFormData,
  mode: "create" | "update",
): Record<string, string> => {
  const name = (data.name || "").trim();
  const photo = (data.photo || "").trim();
  const organization = (data.organization || "").trim();
  const position = (data.position || "").trim();
  const specialization = (data.specialization || "").trim();
  const shortInfo = (data.short_info || "").trim();
  const webinarIds = (data.webinar_ids || "").trim();

  if (mode === "create") {
    const body: Record<string, string> = { name };
    if (photo) body.photo = photo;
    if (organization) body.organization = organization;
    if (position) body.position = position;
    if (specialization) body.specialization = specialization;
    if (shortInfo) body.short_info = shortInfo;
    if (webinarIds) body.webinar_ids = webinarIds;
    return body;
  }

  // PATCH: всегда шлём опциональные поля — пустая строка очищает значение
  return {
    name,
    photo,
    organization,
    position,
    specialization,
    short_info: shortInfo,
    webinar_ids: webinarIds,
  };
};

export const expertsApi = createApi({
  reducerPath: "expertsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Expert"],
  endpoints: (builder) => ({
    getExperts: builder.query<Expert[], void>({
      query: () => "/admin/expert/all",
      transformResponse: (response: unknown) =>
        parseListResponse<Expert>(response).map((expert) => ({
          ...expert,
          id: String(expert.id),
          short_info: expert.short_info ?? "",
          webinar_ids: expert.webinar_ids ?? "",
        })),
      providesTags: ["Expert"],
    }),
    getExpertById: builder.query<Expert, string>({
      query: (id) => `/admin/expert/${id}`,
      transformResponse: (response: Expert) => ({
        ...response,
        id: String(response.id),
        short_info: response.short_info ?? "",
        webinar_ids: response.webinar_ids ?? "",
      }),
      providesTags: (_result, _error, id) => [{ type: "Expert", id }],
    }),
    uploadPhoto: builder.mutation<UploadPhotoResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/admin/images/upload",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: unknown) => {
        if (typeof response === "string") {
          return { url: response };
        }
        if (response && typeof response === "object") {
          const data = response as Record<string, string>;
          if (data.url) return { url: data.url };
          if (data.file_url) return { url: data.file_url };
        }
        return { url: "" };
      },
    }),
    createExpert: builder.mutation<Expert, ExpertFormData>({
      query: (data) => ({
        url: "/admin/create/expert",
        method: "POST",
        body: buildExpertBody(data, "create"),
      }),
      invalidatesTags: ["Expert"],
    }),
    updateExpert: builder.mutation<
      Expert,
      { id: string; data: ExpertFormData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/expert/update/${id}`,
        method: "PATCH",
        body: buildExpertBody(data, "update"),
      }),
      invalidatesTags: ["Expert"],
    }),
    deleteExpert: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/expert/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expert"],
    }),
  }),
});

export const {
  useGetExpertsQuery,
  useGetExpertByIdQuery,
  useUploadPhotoMutation,
  useCreateExpertMutation,
  useUpdateExpertMutation,
  useDeleteExpertMutation,
} = expertsApi;
