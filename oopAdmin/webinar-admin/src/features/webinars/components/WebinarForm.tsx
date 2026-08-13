import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_ERROR,
  isAllowedImageFile,
} from "../../../shared/imageUpload";
import { Webinar, WebinarFormData } from "../types";
import {
  useGetExpertsQuery,
  useUploadPhotoMutation,
} from "../../experts/api/expertsApi";
import { useGetRubricsQuery } from "../../rubrics/api/rubricsApi";
import { mediaUrl } from "../../../shared/baseQuery";

const optionalUrl = z
  .string()
  .refine(
    (val) => !val || /^https?:\/\/.+/.test(val),
    "Введите корректную ссылку",
  );

const videoLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const durationPattern = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/;

const webinarSchema = z
  .object({
    title: z.string().min(1, "Название обязательно"),
    description: z.string().min(1, "Описание обязательно"),
    date: z.string().min(1, "Дата обязательна"),
    time: z.string().min(1, "Время обязательно"),
    end_date: z.string(),
    end_time: z.string(),
    duration: z
      .string()
      .refine(
        (val) => !val.trim() || durationPattern.test(val.trim()),
        "Формат: MM:SS или HH:MM:SS",
      ),
    talk_points: z.array(z.string()),
    video_links: z.array(videoLinkSchema).max(4),
    expert_id: z.string(),
    rubric_ids: z.array(z.number()),
    stream_url: optionalUrl,
    question_url: optionalUrl,
    photo: z.string(),
    preview: z.string(),
    is_published: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const hasEndDate = Boolean(data.end_date?.trim());
    const hasEndTime = Boolean(data.end_time?.trim());
    if (hasEndDate !== hasEndTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите и дату, и время окончания",
        path: hasEndDate ? ["end_time"] : ["end_date"],
      });
    }

    if (
      hasEndDate &&
      hasEndTime &&
      data.date?.trim() &&
      data.time?.trim()
    ) {
      const start = new Date(`${data.date}T${data.time}`);
      const end = new Date(`${data.end_date}T${data.end_time}`);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Окончание не может быть раньше начала",
          path: ["end_date"],
        });
      }
    }

    data.video_links.forEach((link, index) => {
      const hasLabel = Boolean(link.label?.trim());
      const hasUrl = Boolean(link.url?.trim());
      if (hasLabel && !hasUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите URL или удалите ссылку",
          path: ["video_links", index, "url"],
        });
      }
      if (hasUrl && !hasLabel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите название площадки",
          path: ["video_links", index, "label"],
        });
      }
      if (hasUrl && !/^https?:\/\/.+/.test(link.url.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Введите корректную ссылку",
          path: ["video_links", index, "url"],
        });
      }
    });
  });

interface Props {
  initialData?: Webinar;
  onSubmit: (data: WebinarFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const getFullImageUrl = (url: string) => mediaUrl(url);

const VIDEO_PLACEHOLDERS = [
  "ВКонтакте",
  "Рутуб",
  "Одноклассники",
  "МТС Линк",
];

const toFormData = (webinar?: Webinar): WebinarFormData => ({
  title: webinar?.title ?? "",
  description: webinar?.description ?? "",
  date: webinar?.date ?? "",
  time: webinar?.time ?? "",
  end_date: webinar?.end_date ?? "",
  end_time: webinar?.end_time ?? "",
  duration: webinar?.duration ?? "",
  talk_points:
    webinar?.talk_points?.length && webinar.talk_points.some((p) => p.trim())
      ? webinar.talk_points
      : [""],
  video_links: webinar?.video_links?.length
    ? webinar.video_links.map((l) => ({
        label: l.label ?? "",
        url: l.url ?? "",
      }))
    : [],
  expert_id: webinar?.expert_id ?? "",
  rubric_ids: webinar?.rubric_ids ?? [],
  stream_url: webinar?.stream_url ?? "",
  question_url: webinar?.question_url ?? "",
  photo: webinar?.photo ?? "",
  preview: webinar?.preview ?? "",
  is_published: webinar?.is_published ?? false,
});

export const WebinarForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: Props) => {
  const [uploadPhoto, { isLoading: isUploadingPhoto }] =
    useUploadPhotoMutation();
  const [uploadPreview, { isLoading: isUploadingPreview }] =
    useUploadPhotoMutation();
  const { data: rubrics = [] } = useGetRubricsQuery();
  const { data: experts = [] } = useGetExpertsQuery();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<WebinarFormData>({
    resolver: zodResolver(webinarSchema),
    defaultValues: toFormData(initialData),
  });

  const {
    fields: videoFields,
    append: appendVideoLink,
    remove: removeVideoLink,
  } = useFieldArray({
    control,
    name: "video_links",
  });

  const photoValue = watch("photo");
  const previewValue = watch("preview");
  const rubricIds = watch("rubric_ids") || [];
  const expertId = watch("expert_id") || "";
  const talkPoints = watch("talk_points") || [""];

  const selectedExpert = useMemo(
    () => experts.find((expert) => String(expert.id) === String(expertId)),
    [experts, expertId],
  );

  const selectedRubricIds = useMemo(
    () => new Set(rubricIds.map(Number)),
    [rubricIds],
  );

  useEffect(() => {
    if (initialData) {
      reset(toFormData(initialData));
    }
  }, [initialData, reset]);

  const setTalkPoint = (index: number, value: string) => {
    const next = [...talkPoints];
    next[index] = value;
    setValue("talk_points", next, { shouldDirty: true });
  };

  const addTalkPoint = () => {
    setValue("talk_points", [...talkPoints, ""], { shouldDirty: true });
  };

  const removeTalkPointAt = (index: number) => {
    if (talkPoints.length <= 1) {
      setValue("talk_points", [""], { shouldDirty: true });
      return;
    }
    setValue(
      "talk_points",
      talkPoints.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "photo" | "preview",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAllowedImageFile(file)) {
      toast.error(ALLOWED_IMAGE_ERROR);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл не должен превышать 5MB");
      return;
    }

    const upload = field === "photo" ? uploadPhoto : uploadPreview;

    try {
      const result = await upload(file).unwrap();
      setValue(field, result.url);
      toast.success(field === "photo" ? "Фото загружено" : "Превью загружено");
    } catch {
      toast.error("Ошибка при загрузке изображения");
    }
  };

  const toggleRubric = (id: number) => {
    const next = selectedRubricIds.has(id)
      ? rubricIds.filter((item) => Number(item) !== id)
      : [...rubricIds, id];
    setValue("rubric_ids", next);
  };

  const submitForm = (data: WebinarFormData) => {
    onSubmit({
      ...data,
      talk_points: (data.talk_points || [])
        .map((p) => p.trim())
        .filter(Boolean),
      video_links: (data.video_links || []).map((l) => ({
        label: (l.label || "").trim(),
        url: (l.url || "").trim(),
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="card">
      <section className="form-section">
        <h2 className="form-section__title">Основное</h2>
        <div className="form-group">
          <label className="label">Название *</label>
          <input {...register("title")} className="input" />
          {errors.title && (
            <p className="text-red mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="form-group">
          <label className="label">Краткое описание *</label>
          <textarea
            {...register("description")}
            className="input"
            rows={3}
            style={{ resize: "vertical" }}
          />
          {errors.description && (
            <p className="text-red mt-1">{errors.description.message}</p>
          )}
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">Когда</h2>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Дата начала *</label>
            <input type="date" {...register("date")} className="input" />
            {errors.date && (
              <p className="text-red mt-1">{errors.date.message}</p>
            )}
          </div>
          <div className="form-group">
            <label className="label">Время начала *</label>
            <input type="time" {...register("time")} className="input" />
            {errors.time && (
              <p className="text-red mt-1">{errors.time.message}</p>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label">Дата окончания</label>
            <input type="date" {...register("end_date")} className="input" />
            {errors.end_date && (
              <p className="text-red mt-1">{errors.end_date.message}</p>
            )}
          </div>
          <div className="form-group">
            <label className="label">Время окончания</label>
            <input type="time" {...register("end_time")} className="input" />
            {errors.end_time && (
              <p className="text-red mt-1">{errors.end_time.message}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="label">Длительность видео</label>
          <input
            {...register("duration")}
            className="input"
            placeholder="MM:SS или HH:MM:SS, например 32:40"
          />
          {errors.duration && (
            <p className="text-red mt-1">{errors.duration.message}</p>
          )}
          <p className="form-hint">
            Отображается на сайте у прошедших вебинаров
          </p>
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">Эксперт и рубрики</h2>
        <div className="form-group">
          <label className="label">Эксперт</label>
          <select {...register("expert_id")} className="input">
            <option value="">Не выбран</option>
            {experts.length === 0 ? (
              <option value="" disabled>
                Нет экспертов — создайте в разделе «Эксперты»
              </option>
            ) : (
              experts.map((expert) => (
                <option key={expert.id} value={expert.id}>
                  {expert.name}
                  {expert.position ? ` — ${expert.position}` : ""}
                </option>
              ))
            )}
          </select>
          <p className="form-hint">
            Фото, ФИО и должность подтянутся в модалку на сайте
          </p>
          {selectedExpert && (
            <div className="entity-preview">
              {selectedExpert.photo ? (
                <img
                  src={getFullImageUrl(selectedExpert.photo)}
                  alt={selectedExpert.name}
                  className="entity-preview__photo"
                />
              ) : (
                <div className="entity-preview__photo entity-preview__photo--empty" />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{selectedExpert.name}</div>
                <div className="form-hint" style={{ margin: 0 }}>
                  {[selectedExpert.position, selectedExpert.organization]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="label">Рубрики</label>
          <div className="checkbox-panel checkbox-panel--compact">
            {rubrics.length === 0 ? (
              <p className="form-hint" style={{ margin: 0 }}>
                Нет рубрик. Создайте их в разделе «Рубрики».
              </p>
            ) : (
              rubrics.map((rubric) => {
                const id = Number(rubric.id);
                return (
                  <label key={rubric.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedRubricIds.has(id)}
                      onChange={() => toggleRubric(id)}
                    />
                    <span>{rubric.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">Контент</h2>

        <div className="form-group">
          <label className="label">О чем поговорим</label>
          <div className="stack-list">
            {talkPoints.map((point, index) => (
              <div key={`talk-${index}`} className="stack-list__row">
                <input
                  className="input"
                  value={point}
                  onChange={(e) => setTalkPoint(index, e.target.value)}
                  placeholder={`Пункт ${index + 1}`}
                />
                <button
                  type="button"
                  className="icon-button icon-delete"
                  onClick={() => removeTalkPointAt(index)}
                  disabled={talkPoints.length <= 1 && !point.trim()}
                  aria-label="Удалить пункт"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={addTalkPoint}
            style={{ marginTop: "0.5rem" }}
          >
            <Plus size={16} />
            Добавить пункт
          </button>
          <p className="form-hint">
            Пункты для модалки прошедшего вебинара
          </p>
        </div>

        <div className="form-group">
          <label className="label">Ссылка на трансляцию (Rutube)</label>
          <input
            {...register("stream_url")}
            placeholder="https://rutube.ru/..."
            className="input"
          />
          {errors.stream_url && (
            <p className="text-red mt-1">{errors.stream_url.message}</p>
          )}
        </div>

        <div className="form-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <label className="label" style={{ margin: 0 }}>
              Ссылки на просмотр (до 4)
            </label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => appendVideoLink({ label: "", url: "" })}
              disabled={videoFields.length >= 4}
            >
              <Plus size={16} />
              Добавить ссылку
            </button>
          </div>
          <p className="form-hint">
            Для модалки прошедшего вебинара. Нужны и название, и URL.
          </p>
          {videoFields.length === 0 && (
            <p className="form-hint">Пока нет ссылок — нажмите «Добавить ссылку».</p>
          )}
          {videoFields.map((field, index) => (
            <div key={field.id} className="stack-list__row" style={{ marginBottom: "0.5rem" }}>
              <div className="form-row" style={{ flex: 1, margin: 0 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <input
                    {...register(`video_links.${index}.label` as const)}
                    className="input"
                    placeholder={VIDEO_PLACEHOLDERS[index] || "Название"}
                  />
                  {errors.video_links?.[index]?.label && (
                    <p className="text-red mt-1">
                      {errors.video_links[index]?.label?.message}
                    </p>
                  )}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <input
                    {...register(`video_links.${index}.url` as const)}
                    className="input"
                    placeholder="https://..."
                  />
                  {errors.video_links?.[index]?.url && (
                    <p className="text-red mt-1">
                      {errors.video_links[index]?.url?.message}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="icon-button icon-delete"
                onClick={() => removeVideoLink(index)}
                aria-label="Удалить ссылку"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {typeof errors.video_links?.message === "string" && (
            <p className="text-red mt-1">{errors.video_links.message}</p>
          )}
        </div>

        <div className="form-group">
          <label className="label">Ссылка «Задать вопрос»</label>
          <input
            {...register("question_url")}
            placeholder="https://..."
            className="input"
          />
          {errors.question_url && (
            <p className="text-red mt-1">{errors.question_url.message}</p>
          )}
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">Медиа</h2>

        <div className="form-group">
          <label className="label">Фото для главной</label>
          <div className="flex items-center gap-4">
            <label
              className="btn btn-secondary"
              style={{ cursor: "pointer", position: "relative" }}
            >
              <Upload size={16} />
              {isUploadingPhoto ? "Загрузка..." : "Выбрать файл"}
              <input
                type="file"
                accept={ALLOWED_IMAGE_ACCEPT}
                onChange={(e) => handleImageUpload(e, "photo")}
                style={{ position: "absolute", opacity: 0, cursor: "pointer" }}
                disabled={isUploadingPhoto}
              />
            </label>
            {photoValue && (
              <>
                <img
                  src={getFullImageUrl(photoValue)}
                  alt="главное"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setValue("photo", "")}
                >
                  Убрать
                </button>
              </>
            )}
          </div>
          <input type="hidden" {...register("photo")} />
        </div>

        <div className="form-group">
          <label className="label">Превью для списка</label>
          <div className="flex items-center gap-4">
            <label
              className="btn btn-secondary"
              style={{ cursor: "pointer", position: "relative" }}
            >
              <Upload size={16} />
              {isUploadingPreview ? "Загрузка..." : "Выбрать файл"}
              <input
                type="file"
                accept={ALLOWED_IMAGE_ACCEPT}
                onChange={(e) => handleImageUpload(e, "preview")}
                style={{ position: "absolute", opacity: 0, cursor: "pointer" }}
                disabled={isUploadingPreview}
              />
            </label>
            {previewValue && (
              <>
                <img
                  src={getFullImageUrl(previewValue)}
                  alt="preview"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setValue("preview", "")}
                >
                  Убрать
                </button>
              </>
            )}
          </div>
          <input type="hidden" {...register("preview")} />
        </div>
      </section>

      <section className="form-section">
        <h2 className="form-section__title">Публикация</h2>
        <div className="form-group">
          <label className="checkbox-row">
            <input type="checkbox" {...register("is_published")} />
            <span>Опубликован</span>
          </label>
        </div>
      </section>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={
            isSubmitting || isLoading || isUploadingPhoto || isUploadingPreview
          }
          className="btn btn-primary"
        >
          {isSubmitting || isLoading
            ? "Сохранение..."
            : initialData
              ? "Обновить"
              : "Создать"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Отмена
        </button>
      </div>
    </form>
  );
};
