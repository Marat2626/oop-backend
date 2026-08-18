import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Social, SocialFormData } from "../types";
import { useUploadPhotoMutation } from "../../experts/api/expertsApi";
import { toast } from "sonner";
import { Upload, Eye } from "lucide-react";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_ERROR,
  ALLOWED_IMAGE_HINT,
  isAllowedImageFile,
} from "../../../shared/imageUpload";
import { SocialPreview } from "./SocialPreview";
import { mediaUrl } from "../../../shared/baseQuery";

const socialSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  url: z.string().url("Введите корректную ссылку"),
  icon: z.string().optional(),
});

interface Props {
  initialData?: Social;
  onSubmit: (data: SocialFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const emptyFormValues: SocialFormData = {
  name: "",
  url: "",
  icon: "",
};

const toFormValues = (social?: Social): SocialFormData =>
  social
    ? {
        name: social.name,
        url: social.url,
        icon: social.icon || "",
      }
    : emptyFormValues;

export const SocialForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: Props) => {
  const [uploadIcon, { isLoading: isUploading }] = useUploadPhotoMutation();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<SocialFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm<SocialFormData>({
    resolver: zodResolver(socialSchema),
    defaultValues: toFormValues(initialData),
  });

  const iconValue = watch("icon");
  const formValues = watch();

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
      const result = await uploadIcon(file).unwrap();
      setValue("icon", result.url, { shouldDirty: true });
      toast.success("Иконка загружена");
    } catch {
      toast.error("Ошибка при загрузке иконки");
    } finally {
      e.target.value = "";
    }
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
            <label className="label">Название *</label>
            <input
              {...register("name")}
              className="input"
              placeholder="VK, Rutube, YouTube..."
            />
            {errors.name && (
              <p className="text-red mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="label">Ссылка *</label>
            <input
              {...register("url")}
              className="input"
              placeholder="https://..."
            />
            {errors.url && (
              <p className="text-red mt-1">{errors.url.message}</p>
            )}
            <p className="form-hint">
              Полный URL страницы или канала, куда ведёт карточка на сайте
            </p>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Иконка</h2>
          <div className="form-group">
            <label className="label">Файл иконки</label>
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
              {iconValue ? (
                <>
                  <img
                    src={mediaUrl(iconValue)}
                    alt="иконка"
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "contain",
                      borderRadius: 8,
                      background: "#f5f5f7",
                      padding: 4,
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setValue("icon", "", { shouldDirty: true })}
                  >
                    Убрать
                  </button>
                </>
              ) : null}
            </div>
            <input type="hidden" {...register("icon")} />
            <p className="form-hint">{ALLOWED_IMAGE_HINT}</p>
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

      <SocialPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={
          previewData || {
            name: formValues.name || "",
            url: formValues.url || "",
            icon: formValues.icon || "",
          }
        }
      />
    </>
  );
};
