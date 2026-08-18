import { createApi } from "@reduxjs/toolkit/query/react";
import { VideoLink, Webinar, WebinarApi, WebinarFormData } from "../types";
import { baseQueryWithAuth } from "../../../shared/baseQuery";

const parseListResponse = <T>(response: unknown): T[] => {
  if (response && typeof response === "object" && "items" in response) {
    const items = (response as { items: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  if (Array.isArray(response)) return response as T[];
  return [];
};

const parseDateTime = (
  value?: string | null,
): { date: string; time: string } => {
  if (!value) return { date: "", time: "" };

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const [datePart, timePart = ""] = normalized.split("T");

  return {
    date: datePart.slice(0, 10),
    time: timePart.slice(0, 5),
  };
};

const normalizeVideoLinks = (links?: VideoLink[] | null): VideoLink[] => {
  if (!Array.isArray(links)) return [];
  return links.slice(0, 4).map((link) => ({
    label: link?.label ?? "",
    url: link?.url ?? "",
  }));
};

const normalizeTalkPoints = (points?: string[] | null): string[] => {
  if (!Array.isArray(points)) return [];
  return points.map((item) => String(item).trim()).filter(Boolean);
};

const resolveRubricIds = (api: WebinarApi): number[] => {
  if (Array.isArray(api.rubric_ids) && api.rubric_ids.length > 0) {
    return api.rubric_ids.map(Number);
  }
  if (Array.isArray(api.rubrics) && api.rubrics.length > 0) {
    return api.rubrics.map((r) => Number(r.id));
  }
  return [];
};

const mapApiToWebinar = (api: WebinarApi): Webinar => {
  const start = parseDateTime(api.start_time);
  const end = parseDateTime(api.end_time);

  return {
    id: String(api.id),
    title: api.title ?? "",
    description: api.description ?? "",
    date: start.date,
    time: start.time,
    end_date: end.date,
    end_time: end.time,
    duration: api.duration ?? "",
    talk_points: normalizeTalkPoints(api.talk_points),
    video_links: normalizeVideoLinks(api.video_links),
    expert_id: api.expert_id != null ? String(api.expert_id) : "",
    expert_name: api.expert?.name ?? "",
    rubric_ids: resolveRubricIds(api),
    stream_url: api.stream_url ?? "",
    question_url: api.question_url ?? "",
    photo: api.photo ?? "",
    preview: api.preview ?? "",
    is_published: Boolean(api.is_published),
  };
};

const buildDateTime = (date: string, time: string): string =>
  `${date}T${time.length === 5 ? `${time}:00` : time}`;

const cleanVideoLinks = (links: VideoLink[] | undefined): VideoLink[] => {
  if (!Array.isArray(links)) return [];
  return links
    .map((link) => ({
      label: (link.label || "").trim(),
      url: (link.url || "").trim(),
    }))
    .filter((link) => link.label && link.url)
    .slice(0, 4);
};

const buildWebinarBody = (
  data: WebinarFormData,
  mode: "create" | "update",
): Record<string, unknown> => {
  const body: Record<string, unknown> = {
    title: data.title.trim(),
    description: data.description.trim(),
    is_published: data.is_published,
    talk_points: normalizeTalkPoints(data.talk_points),
    video_links: cleanVideoLinks(data.video_links),
    rubric_ids: Array.isArray(data.rubric_ids) ? data.rubric_ids : [],
  };

  if (data.date?.trim() && data.time?.trim()) {
    body.start_time = buildDateTime(data.date.trim(), data.time.trim());
  }

  const expertId = String(data.expert_id || "").trim();
  body.expert_id = expertId ? Number(expertId) : null;

  const duration = (data.duration || "").trim();
  const streamUrl = (data.stream_url || "").trim();
  const questionUrl = (data.question_url || "").trim();
  const photo = (data.photo || "").trim();
  const preview = (data.preview || "").trim();
  const hasEnd =
    Boolean(data.end_date?.trim()) && Boolean(data.end_time?.trim());

  if (mode === "create") {
    if (duration) body.duration = duration;
    if (streamUrl) body.stream_url = streamUrl;
    if (questionUrl) body.question_url = questionUrl;
    if (photo) body.photo = photo;
    if (preview) body.preview = preview;
    if (hasEnd) {
      body.end_time = buildDateTime(
        data.end_date.trim(),
        data.end_time.trim(),
      );
    }
  } else {
    // PATCH: всегда шлём опциональные поля, чтобы пустое очищало значение на бэке
    body.duration = duration;
    body.stream_url = streamUrl;
    body.question_url = questionUrl;
    body.photo = photo;
    body.preview = preview;
    body.end_time = hasEnd
      ? buildDateTime(data.end_date.trim(), data.end_time.trim())
      : null;
  }

  return body;
};

export const webinarsApi = createApi({
  reducerPath: "webinarsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Webinar"],
  endpoints: (builder) => ({
    getWebinars: builder.query<Webinar[], void>({
      query: () => "/admin/webinar/all",
      transformResponse: (response: unknown) =>
        parseListResponse<WebinarApi>(response).map(mapApiToWebinar),
      providesTags: ["Webinar"],
    }),
    getWebinarById: builder.query<Webinar, string>({
      query: (id) => `/admin/webinar/${id}`,
      transformResponse: (response: WebinarApi) => mapApiToWebinar(response),
      providesTags: (_result, _error, id) => [{ type: "Webinar", id }],
    }),
    createWebinar: builder.mutation<Webinar, WebinarFormData>({
      query: (data) => ({
        url: "/admin/create/webinar",
        method: "POST",
        body: buildWebinarBody(data, "create"),
      }),
      transformResponse: (response: WebinarApi) => mapApiToWebinar(response),
      invalidatesTags: ["Webinar"],
    }),
    updateWebinar: builder.mutation<
      Webinar,
      { id: string; data: WebinarFormData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/webinar/update/${id}`,
        method: "PATCH",
        body: buildWebinarBody(data, "update"),
      }),
      transformResponse: (response: WebinarApi) => mapApiToWebinar(response),
      invalidatesTags: ["Webinar"],
    }),
    deleteWebinar: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/webinar/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Webinar"],
    }),
  }),
});

export const {
  useGetWebinarsQuery,
  useGetWebinarByIdQuery,
  useCreateWebinarMutation,
  useUpdateWebinarMutation,
  useDeleteWebinarMutation,
} = webinarsApi;
