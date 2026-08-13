import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rubric, RubricFormData } from "../types";

const rubricSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
});

interface Props {
  initialData?: Rubric;
  onSubmit: (data: RubricFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RubricForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RubricFormData>({
    resolver: zodResolver(rubricSchema),
    defaultValues: { name: initialData?.name ?? "" },
  });

  useEffect(() => {
    reset({ name: initialData?.name ?? "" });
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <section className="form-section">
        <h2 className="form-section__title">Основное</h2>
        <div className="form-group">
          <label className="label">Название *</label>
          <input
            {...register("name")}
            className="input"
            placeholder="Маркетинг, HR, Продажи..."
          />
          {errors.name && (
            <p className="text-red mt-1">{errors.name.message}</p>
          )}
          <p className="form-hint">
            Рубрика используется для фильтрации вебинаров на сайте и в админке
          </p>
        </div>
      </section>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
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
