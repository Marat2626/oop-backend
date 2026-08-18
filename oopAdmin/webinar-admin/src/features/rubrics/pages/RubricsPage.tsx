import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { RubricsTable } from "../components/RubricsTable";
import { RubricForm } from "../components/RubricForm";
import { RubricFormData } from "../types";
import {
  useCreateRubricMutation,
  useGetRubricByIdQuery,
  useUpdateRubricMutation,
} from "../api/rubricsApi";
import { getApiErrorMessage } from "../../../shared/apiError";

type PageMode = "list" | "create" | "edit";

export const RubricsPage = () => {
  const [mode, setMode] = useState<PageMode>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [createRubric, { isLoading: isCreating }] = useCreateRubricMutation();
  const [updateRubric, { isLoading: isUpdating }] = useUpdateRubricMutation();

  const {
    data: editingRubric,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isError: isDetailError,
    error: detailError,
  } = useGetRubricByIdQuery(editId!, {
    skip: mode !== "edit" || !editId,
  });

  useEffect(() => {
    if (mode !== "edit" || !isDetailError) return;
    toast.error(
      getApiErrorMessage(detailError, "Не удалось загрузить рубрику"),
    );
    setMode("list");
    setEditId(null);
  }, [mode, isDetailError, detailError]);

  const closeForm = () => {
    setMode("list");
    setEditId(null);
  };

  const handleSubmit = async (data: RubricFormData) => {
    try {
      if (mode === "edit" && editId) {
        await updateRubric({ id: editId, data }).unwrap();
        toast.success("Рубрика обновлена");
      } else {
        await createRubric(data).unwrap();
        toast.success("Рубрика создана");
      }
      closeForm();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Ошибка при сохранении"));
    }
  };

  const showForm = mode === "create" || mode === "edit";
  const detailPending =
    mode === "edit" && (isLoadingDetail || isFetchingDetail) && !editingRubric;

  const pageTitle =
    mode === "edit"
      ? "Редактирование рубрики"
      : mode === "create"
        ? "Новая рубрика"
        : "Рубрики";

  return (
    <div>
      <div className="page-header">
        {showForm ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={closeForm}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <ArrowLeft size={18} />
              Назад
            </button>
            <h1 className="page-title" style={{ margin: 0 }}>
              {pageTitle}
            </h1>
          </div>
        ) : (
          <>
            <h1 className="page-title">{pageTitle}</h1>
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setMode("create");
              }}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Добавить рубрику
            </button>
          </>
        )}
      </div>

      {showForm ? (
        detailPending ? (
          <div className="card">
            <div className="loading">Загрузка рубрики...</div>
          </div>
        ) : (
          <RubricForm
            key={mode === "edit" ? editId || "edit" : "create"}
            initialData={mode === "edit" ? editingRubric : undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isLoading={isCreating || isUpdating}
          />
        )
      ) : (
        <RubricsTable
          onEdit={(rubric) => {
            setEditId(rubric.id);
            setMode("edit");
          }}
        />
      )}
    </div>
  );
};
