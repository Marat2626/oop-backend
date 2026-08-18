import { useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import {
  useGetSiteContentQuery,
  useUpdateSiteContentMutation,
} from "../api/siteContentApi";
import { DEFAULT_SITE_CONTENT, SiteContent } from "../types";
import { useUploadPhotoMutation } from "../../experts/api/expertsApi";
import { useGetWebinarsQuery } from "../../webinars/api/webinarsApi";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_ERROR,
  ALLOWED_IMAGE_HINT,
  isAllowedImageFile,
} from "../../../shared/imageUpload";
import { mediaUrl } from "../../../shared/baseQuery";
import { getApiErrorMessage } from "../../../shared/apiError";

const siteContentSchema = z.object({
  brand: z.object({
    logo_url: z.string(),
    logo_secondary_url: z.string(),
    title_line1: z.string().min(1, "Обязательно"),
    title_line2: z.string().min(1, "Обязательно"),
    title_line3: z.string().min(1, "Обязательно"),
  }),
  nav: z.object({
    home: z.string().min(1, "Обязательно"),
    calendar: z.string().min(1, "Обязательно"),
    webinars: z.string().min(1, "Обязательно"),
    experts: z.string().min(1, "Обязательно"),
    about: z.string().min(1, "Обязательно"),
    question_cta: z.string().min(1, "Обязательно"),
  }),
  home_hero: z.object({
    subtitle: z.string().min(1, "Обязательно"),
    primary_cta: z.string().min(1, "Обязательно"),
    secondary_cta: z.string().min(1, "Обязательно"),
  }),
  home_webinar: z.object({
    next_title: z.string().min(1, "Обязательно"),
    next_link_label: z.string().min(1, "Обязательно"),
    past_title: z.string().min(1, "Обязательно"),
    past_link_label: z.string().min(1, "Обязательно"),
    mode: z.enum(["auto", "force_next", "force_past"]),
    past_display: z.enum(["cards", "featured_video"]),
    media_mode: z.enum(["photo", "stream"]),
    stream_url: z.string(),
    featured_past_webinar_id: z.number().nullable(),
  }),
  about: z.object({
    right_block_1: z.string().min(1, "Обязательно"),
    right_block_2: z.string().min(1, "Обязательно"),
  }),
  stats: z.object({
    webinars_value: z.string().min(1, "Обязательно"),
    webinars_label: z.string().min(1, "Обязательно"),
    listeners_value: z.string().min(1, "Обязательно"),
    listeners_label: z.string().min(1, "Обязательно"),
    topics_value: z.string().min(1, "Обязательно"),
    topics_label: z.string().min(1, "Обязательно"),
  }),
});

type LogoField = "logo_url" | "logo_secondary_url";

export const SiteContentPage = () => {
  const { data, isLoading, error } = useGetSiteContentQuery();
  const [updateSiteContent, { isLoading: isSaving }] =
    useUpdateSiteContentMutation();
  const [uploadPhoto, { isLoading: isUploading }] = useUploadPhotoMutation();
  const { data: webinars = [] } = useGetWebinarsQuery();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SiteContent>({
    resolver: zodResolver(siteContentSchema),
    defaultValues: DEFAULT_SITE_CONTENT,
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mode = watch("home_webinar.mode");
  const pastDisplay = watch("home_webinar.past_display");
  const mediaMode = watch("home_webinar.media_mode");
  const logoUrl = watch("brand.logo_url");
  const logoSecondaryUrl = watch("brand.logo_secondary_url");

  const pastWebinars = useMemo(() => {
    const now = Date.now();
    return webinars
      .filter((w) => {
        if (!w.date) return false;
        const start = new Date(`${w.date}T${w.time || "00:00"}`).getTime();
        return Number.isFinite(start) && start < now;
      })
      .sort((a, b) => {
        const aTs = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const bTs = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        return bTs - aTs;
      });
  }, [webinars]);

  const showFeaturedSelect =
    mode === "force_past" || pastDisplay === "featured_video";

  const handleLogoUpload = async (
    field: LogoField,
    e: ChangeEvent<HTMLInputElement>,
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
    try {
      const result = await uploadPhoto(file).unwrap();
      setValue(`brand.${field}`, result.url, { shouldDirty: true });
      toast.success("Логотип загружен");
    } catch {
      toast.error("Ошибка при загрузке логотипа");
    } finally {
      e.target.value = "";
    }
  };

  const onSubmit = async (formData: SiteContent) => {
    try {
      const payload: SiteContent = {
        ...formData,
        home_webinar: {
          ...formData.home_webinar,
          featured_past_webinar_id: showFeaturedSelect
            ? formData.home_webinar.featured_past_webinar_id
            : null,
        },
      };
      await updateSiteContent(payload).unwrap();
      toast.success("Контент сайта сохранён");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Ошибка при сохранении"));
    }
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="text-red">Ошибка загрузки контента</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Контент сайта</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <section className="form-section">
          <h2 className="form-section__title">Бренд</h2>
          <p className="form-hint" style={{ marginBottom: "1rem" }}>
            Заголовок общий для главной и страницы «О нас». Первый логотип на
            сайте (университет) всегда дефолтный. Сюда загружается картинка
            только для второго логотипа; пустое поле — дефолтный файл.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Логотип (второй на сайте)</label>
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
                    onChange={(e) => handleLogoUpload("logo_url", e)}
                    style={{ position: "absolute", opacity: 0, cursor: "pointer" }}
                    disabled={isUploading}
                  />
                </label>
                {logoUrl ? (
                  <>
                    <img
                      src={mediaUrl(logoUrl)}
                      alt="logo"
                      style={{ height: 40, objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        setValue("brand.logo_url", "", { shouldDirty: true })
                      }
                    >
                      Убрать
                    </button>
                  </>
                ) : null}
              </div>
              <input type="hidden" {...register("brand.logo_url")} />
            </div>

            <div className="form-group">
              <label className="label">Логотип (доп.)</label>
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
                    onChange={(e) => handleLogoUpload("logo_secondary_url", e)}
                    style={{ position: "absolute", opacity: 0, cursor: "pointer" }}
                    disabled={isUploading}
                  />
                </label>
                {logoSecondaryUrl ? (
                  <>
                    <img
                      src={mediaUrl(logoSecondaryUrl)}
                      alt="logo secondary"
                      style={{ height: 40, objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        setValue("brand.logo_secondary_url", "", {
                          shouldDirty: true,
                        })
                      }
                    >
                      Убрать
                    </button>
                  </>
                ) : null}
              </div>
              <input type="hidden" {...register("brand.logo_secondary_url")} />
            </div>
          </div>
          <p className="form-hint">{ALLOWED_IMAGE_HINT}</p>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Строка 1 *</label>
              <input {...register("brand.title_line1")} className="input" />
              {errors.brand?.title_line1 && (
                <p className="text-red mt-1">
                  {errors.brand.title_line1.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="label">Строка 2 *</label>
              <input {...register("brand.title_line2")} className="input" />
              {errors.brand?.title_line2 && (
                <p className="text-red mt-1">
                  {errors.brand.title_line2.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <label className="label">Строка 3 *</label>
              <input {...register("brand.title_line3")} className="input" />
              {errors.brand?.title_line3 && (
                <p className="text-red mt-1">
                  {errors.brand.title_line3.message}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Шапка</h2>
          <p className="form-hint" style={{ marginBottom: "1rem" }}>
            Меняются только подписи. Маршруты фиксированы.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Главная (/) *</label>
              <input {...register("nav.home")} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Календарь (/calendar) *</label>
              <input {...register("nav.calendar")} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Выпуски (/webinars) *</label>
              <input {...register("nav.webinars")} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Эксперты (/experts) *</label>
              <input {...register("nav.experts")} className="input" />
            </div>
            <div className="form-group">
              <label className="label">О нас (/about) *</label>
              <input {...register("nav.about")} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Кнопка «Задай вопрос» *</label>
              <input {...register("nav.question_cta")} className="input" />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Главная · герой</h2>
          <div className="form-group">
            <label className="label">Подзаголовок *</label>
            <textarea
              {...register("home_hero.subtitle")}
              className="input"
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Основная кнопка *</label>
              <input {...register("home_hero.primary_cta")} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Вторая кнопка *</label>
              <input
                {...register("home_hero.secondary_cta")}
                className="input"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Главная · блок вебинара</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Заголовок ближайшего *</label>
              <input
                {...register("home_webinar.next_title")}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">Ссылка ближайшего *</label>
              <input
                {...register("home_webinar.next_link_label")}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">Заголовок прошедшего *</label>
              <input
                {...register("home_webinar.past_title")}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="label">Ссылка прошедшего *</label>
              <input
                {...register("home_webinar.past_link_label")}
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Режим показа *</label>
              <select {...register("home_webinar.mode")} className="input">
                <option value="auto">Авто (ближайший, иначе прошедший)</option>
                <option value="force_next">Всегда ближайший</option>
                <option value="force_past">Всегда прошедший</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Отображение прошедшего *</label>
              <select
                {...register("home_webinar.past_display")}
                className="input"
              >
                <option value="cards">Карточки</option>
                <option value="featured_video">Одно видео</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Слева у ближайшего *</label>
              <select
                {...register("home_webinar.media_mode")}
                className="input"
              >
                <option value="photo">Фото вебинара</option>
                <option value="stream">Онлайн-эфир (VK / OK)</option>
              </select>
            </div>
            {mediaMode === "stream" ? (
              <div className="form-group">
                <label className="label">Ссылка на эфир *</label>
                <input
                  {...register("home_webinar.stream_url")}
                  className="input"
                  placeholder="Ссылка на видео или код iframe из «Экспорт»"
                />
                <p className="form-hint">
                  Лучше всего: в VK/OK → Поделиться → Экспорт → скопировать код
                  или только src. Тогда плеер крутится на сайте. Обычная ссылка
                  вида vk.com/video-…_… тоже подойдёт.
                </p>
              </div>
            ) : null}
          </div>

          {showFeaturedSelect ? (
            <div className="form-group">
              <label className="label">Прошедший вебинар для видео</label>
              <select
                className="input"
                value={
                  watch("home_webinar.featured_past_webinar_id") != null
                    ? String(watch("home_webinar.featured_past_webinar_id"))
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setValue(
                    "home_webinar.featured_past_webinar_id",
                    value ? Number(value) : null,
                    { shouldDirty: true },
                  );
                }}
              >
                <option value="">Авто (последний прошедший)</option>
                {pastWebinars.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
              <p className="form-hint">
                Используется при «всегда прошедший» или режиме «одно видео»
              </p>
            </div>
          ) : null}
        </section>

        <section className="form-section">
          <h2 className="form-section__title">О нас</h2>
          <p className="form-hint" style={{ marginBottom: "1rem" }}>
            Два текстовых блока справа в секции «История создания»
          </p>
          <div className="form-group">
            <label className="label">Правый блок 1 *</label>
            <textarea
              {...register("about.right_block_1")}
              className="input"
              rows={4}
            />
          </div>
          <div className="form-group">
            <label className="label">Правый блок 2 *</label>
            <textarea
              {...register("about.right_block_2")}
              className="input"
              rows={4}
            />
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Статистика</h2>
          <p className="form-hint" style={{ marginBottom: "1rem" }}>
            Блок с цифрами на главной и на странице «О нас»
          </p>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Вебинары · значение *</label>
              <input
                {...register("stats.webinars_value")}
                className="input"
                placeholder="600+"
              />
            </div>
            <div className="form-group">
              <label className="label">Вебинары · подпись *</label>
              <input
                {...register("stats.webinars_label")}
                className="input"
                placeholder="вебинаров"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Слушатели · значение *</label>
              <input
                {...register("stats.listeners_value")}
                className="input"
                placeholder="100 000+"
              />
            </div>
            <div className="form-group">
              <label className="label">Слушатели · подпись *</label>
              <input
                {...register("stats.listeners_label")}
                className="input"
                placeholder="слушателей"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Тематики · значение *</label>
              <input
                {...register("stats.topics_value")}
                className="input"
                placeholder="20+"
              />
            </div>
            <div className="form-group">
              <label className="label">Тематики · подпись *</label>
              <input
                {...register("stats.topics_label")}
                className="input"
                placeholder="тематик"
              />
            </div>
          </div>
        </section>

        <div className="flex gap-2" style={{ alignItems: "center" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving || isUploading || !isDirty}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!isDirty || isSaving}
            onClick={() => reset(data || DEFAULT_SITE_CONTENT)}
          >
            Сбросить
          </button>
        </div>
      </form>
    </div>
  );
};
