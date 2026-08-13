import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { WebinarTable } from "../components/WebinarTable";
import { WebinarForm } from "../components/WebinarForm";
import { WebinarFormData } from "../types";
import {
  useCreateWebinarMutation,
  useGetWebinarByIdQuery,
  useUpdateWebinarMutation,
} from "../api/webinarsApi";
import { toast } from "sonner";

type PageMode = "list" | "create" | "edit";

export const WebinarsListPage = () => {
  const [mode, setMode] = useState<PageMode>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [createWebinar, { isLoading: isCreating }] = useCreateWebinarMutation();
  const [updateWebinar, { isLoading: isUpdating }] = useUpdateWebinarMutation();

  const {
    data: editingWebinar,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isError: isDetailError,
    error: detailError,
  } = useGetWebinarByIdQuery(editId!, {
    skip: mode !== "edit" || !editId,
  });

  useEffect(() => {
    if (mode !== "edit" || !isDetailError) return;
    const message =
      (detailError as { data?: { detail?: string; message?: string } })?.data
        ?.detail ||
      (detailError as { data?: { message?: string } })?.data?.message ||
      "Не удалось загрузить вебинар";
    toast.error(typeof message === "string" ? message : "Ошибка загрузки");
    setMode("list");
    setEditId(null);
  }, [mode, isDetailError, detailError]);

  const closeForm = () => {
    setMode("list");
    setEditId(null);
  };

  const handleSubmit = async (data: WebinarFormData) => {
    try {
      if (mode === "edit" && editId) {
        await updateWebinar({ id: editId, data }).unwrap();
        toast.success("Вебинар обновлен");
      } else {
        await createWebinar(data).unwrap();
        toast.success("Вебинар создан");
      }
      closeForm();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error?.data?.message || error?.data?.detail || "Ошибка при сохранении",
      );
    }
  };

  const showForm = mode === "create" || mode === "edit";
  const detailPending =
    mode === "edit" && (isLoadingDetail || isFetchingDetail) && !editingWebinar;

  const pageTitle =
    mode === "edit"
      ? "Редактирование вебинара"
      : mode === "create"
        ? "Новый вебинар"
        : "Управление вебинарами";

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
              Добавить вебинар
            </button>
          </>
        )}
      </div>

      {showForm ? (
        detailPending ? (
          <div className="card">
            <div className="loading">Загрузка вебинара...</div>
          </div>
        ) : (
          <WebinarForm
            key={mode === "edit" ? editId || "edit" : "create"}
            initialData={mode === "edit" ? editingWebinar : undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isLoading={isCreating || isUpdating}
          />
        )
      ) : (
        <WebinarTable
          onEdit={(webinar) => {
            setEditId(webinar.id);
            setMode("edit");
          }}
        />
      )}
    </div>
  );
};
