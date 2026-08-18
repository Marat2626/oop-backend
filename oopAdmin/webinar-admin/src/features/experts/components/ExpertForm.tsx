import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Expert, ExpertFormData } from "../types";
import { useUploadPhotoMutation } from "../api/expertsApi";
import { useGetWebinarsQuery } from "../../webinars/api/webinarsApi";
import { toast } from "sonner";
import { Upload, Eye } from "lucide-react";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_ERROR,
  ALLOWED_IMAGE_HINT,
  isAllowedImageFile,
} from "../../../shared/imageUpload";
import { ExpertPreview } from "../pages/ExpertPreview";
import { mediaUrl } from "../../../shared/baseQuery";

const expertSchema = z.object({
  name: z.string().min(3, "ФИО минимум 3 символа"),
  photo: z.string().optional(),
  organization: z.string().optional(),
  position: z.string().optional(),
  specialization: z.string().optional(),
  short_info: z.string().optional(),
  webinar_ids: z.string().optional(),
});

interface Props {
  initialData?: Expert;
  onSubmit: (data: ExpertFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const getFullPhotoUrl = (photoUrl: string) => mediaUrl(photoUrl);

const parseWebinarIds = (value?: string): string[] =>
  (value || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const emptyFormValues: ExpertFormData = {
  name: "",
  photo: "",
  organization: "",
  position: "",
  specialization: "",
  short_info: "",
  webinar_ids: "",
};

const toFormValues = (expert?: Expert): ExpertFormData =>
  expert
    ? {
        name: expert.name,
        photo: expert.photo || "",
        organization: expert.organization || "",
        position: expert.position || "",
        specialization: expert.specialization || "",
        short_info: expert.short_info || "",
        webinar_ids: expert.webinar_ids || "",
      }
    : emptyFormValues;

export const ExpertForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: Props) => {
  const [uploadPhoto, { isLoading: isUploading }] = useUploadPhotoMutation();
  const { data: webinars = [] } = useGetWebinarsQuery();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ExpertFormData | null>(null);
  const [webinarSearch, setWebinarSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<ExpertFormData>({
    resolver: zodResolver(expertSchema),
    defaultValues: toFormValues(initialData),
  });

  const photoValue = watch("photo");
  const webinarIdsValue = watch("webinar_ids");
  const formValues = watch();

  const selectedWebinarIds = useMemo(
    () => parseWebinarIds(webinarIdsValue),
    [webinarIdsValue],
  );

  const filteredWebinars = useMemo(() => {
    const query = webinarSearch.trim().toLowerCase();
    if (!query) return webinars;
    return webinars.filter((webinar) => {
      const haystack = `${webinar.title} ${webinar.id}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [webinars, webinarSearch]);

  useEffect(() => {
    if (initialData) {
      reset(toFormValues(initialData));
    }
  }, [initialData, reset]);

  const handlePreview = () => {
    setPreviewData(getValues());
    setIsPreviewOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const result = await uploadPhoto(file).unwrap();
      setValue("photo", result.url, { shouldDirty: true });
      toast.success("Фото загружено");
    } catch {
      toast.error("Ошибка при загрузке фото");
    }
  };

  const toggleWebinar = (id: string) => {
    const next = selectedWebinarIds.includes(id)
      ? selectedWebinarIds.filter((item) => item !== id)
      : [...selectedWebinarIds, id];
    setValue("webinar_ids", next.join(","), { shouldDirty: true });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handlePreview}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Eye size={18} />
            Предпросмотр
          </button>
        </div>

        <section className="form-section">
          <h2 className="form-section__title">Основное</h2>
          <div className="form-group">
            <label className="label">ФИО *</label>
            <input {...register("name")} className="input" />
            {errors.name && (
              <p className="text-red mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label">Фото</label>
            <div className="flex items-center gap-4">
              <label
                className="btn btn-secondary"
                style={{ cursor: "pointer", position: "relative" }}
              >
                <Upload size={16} />
                {isUploading ? "Загрузка..." : "Выбрать файл"}
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_ACCEPT}
                  onChange={handleFileChange}
                  style={{ position: "absolute", opacity: 0, cursor: "pointer" }}
                  disabled={isUploading}
                />
              </label>
              {photoValue && (
                <>
                  <img
                    src={getFullPhotoUrl(photoValue)}
                    alt="preview"
                    className="image-preview-circle"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setValue("photo", "", { shouldDirty: true })}
                  >
                    Убрать
                  </button>
                </>
              )}
            </div>
            <input type="hidden" {...register("photo")} />
            <p className="form-hint">{ALLOWED_IMAGE_HINT}</p>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Роль</h2>
          <div className="form-group">
            <label className="label">Организация</label>
            <input {...register("organization")} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Должность</label>
            <input {...register("position")} className="input" />
          </div>
          <div className="form-group">
            <label className="label">Специализация</label>
            <input {...register("specialization")} className="input" />
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Для сайта</h2>
          <div className="form-group">
            <label className="label">Краткая информация</label>
            <textarea
              {...register("short_info")}
              className="input"
              rows={3}
              placeholder="Текст под ФИО в блоке «Ближайший вебинар»"
              style={{ resize: "vertical" }}
            />
            <p className="form-hint">
              Показывается только на главной под именем эксперта в ближайшем
              вебинаре (вместо организации и должности)
            </p>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Вебинары</h2>
          <div className="form-group">
            <label className="label">Вебинары эксперта</label>
            <input type="hidden" {...register("webinar_ids")} />
            <input
              type="search"
              className="input"
              placeholder="Поиск вебинара по названию..."
              value={webinarSearch}
              onChange={(e) => setWebinarSearch(e.target.value)}
              style={{ marginBottom: "0.75rem" }}
            />
            {selectedWebinarIds.length > 0 && (
              <p className="form-hint" style={{ marginBottom: "0.5rem" }}>
                Выбрано: {selectedWebinarIds.length}
              </p>
            )}
            <div className="checkbox-panel">
              {webinars.length === 0 ? (
                <p className="form-hint" style={{ margin: 0 }}>
                  Нет вебинаров
                </p>
              ) : filteredWebinars.length === 0 ? (
                <p className="form-hint" style={{ margin: 0 }}>
                  Ничего не найдено
                </p>
              ) : (
                filteredWebinars.map((webinar) => (
                  <label key={webinar.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedWebinarIds.includes(webinar.id)}
                      onChange={() => toggleWebinar(webinar.id)}
                    />
                    <span>
                      {webinar.title}{" "}
                      <span style={{ color: "#8e8e93" }}>#{webinar.id}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="form-hint">
              Связанные вебинары отображаются в карточке эксперта на сайте
            </p>
          </div>
        </section>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || isUploading || isLoading}
            className="btn btn-primary"
          >
            {isSubmitting || isLoading
              ? "Сохранение..."
              : initialData
                ? "Обновить"
                : "Создать"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Отмена
          </button>
        </div>
      </form>

      <ExpertPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={
          previewData || {
            name: formValues.name || "Имя эксперта",
            photo: formValues.photo || "",
            organization: formValues.organization || "",
            position: formValues.position || "",
            specialization: formValues.specialization || "",
            short_info: formValues.short_info || "",
          }
        }
      />
    </>
  );
};
