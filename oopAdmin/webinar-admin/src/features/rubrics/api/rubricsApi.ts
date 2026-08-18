import { createApi } from "@reduxjs/toolkit/query/react";
import { Rubric, RubricFormData } from "../types";
import { baseQueryWithAuth } from "../../../shared/baseQuery";

const parseListResponse = <T>(response: unknown): T[] => {
  if (response && typeof response === "object" && "items" in response) {
    const items = (response as { items: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  if (Array.isArray(response)) return response as T[];
  return [];
};

const normalizeRubric = (rubric: Rubric): Rubric => ({
  ...rubric,
  id: String(rubric.id),
});

export const rubricsApi = createApi({
  reducerPath: "rubricsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Rubric"],
  endpoints: (builder) => ({
    getRubrics: builder.query<Rubric[], void>({
      query: () => "/public/rubrics",
      transformResponse: (response: unknown) =>
        parseListResponse<Rubric>(response).map(normalizeRubric),
      providesTags: ["Rubric"],
    }),
    getRubricById: builder.query<Rubric, string>({
      query: (id) => `/rubrics/${id}`,
      transformResponse: (response: Rubric) => normalizeRubric(response),
      providesTags: (_result, _error, id) => [{ type: "Rubric", id }],
    }),
    createRubric: builder.mutation<Rubric, RubricFormData>({
      query: (data) => ({
        url: "/admin/create/rubrics",
        method: "POST",
        body: { name: data.name.trim() },
      }),
      invalidatesTags: ["Rubric"],
    }),
    updateRubric: builder.mutation<
      Rubric,
      { id: string; data: RubricFormData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/rubrics/update/${id}`,
        method: "PATCH",
        body: { name: data.name.trim() },
      }),
      invalidatesTags: ["Rubric"],
    }),
    deleteRubric: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/rubrics/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rubric"],
    }),
  }),
});

export const {
  useGetRubricsQuery,
  useGetRubricByIdQuery,
  useCreateRubricMutation,
  useUpdateRubricMutation,
  useDeleteRubricMutation,
} = rubricsApi;
