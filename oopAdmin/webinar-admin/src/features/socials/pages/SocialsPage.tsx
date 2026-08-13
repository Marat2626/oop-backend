import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { SocialsTable } from "../components/SocialsTable";
import { SocialForm } from "../components/SocialForm";
import { SocialFormData } from "../types";
import {
  useCreateSocialMutation,
  useGetSocialByIdQuery,
  useUpdateSocialMutation,
} from "../api/socialsApi";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../../shared/apiError";

type PageMode = "list" | "create" | "edit";

export const SocialsPage = () => {
  const [mode, setMode] = useState<PageMode>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [createSocial, { isLoading: isCreating }] = useCreateSocialMutation();
  const [updateSocial, { isLoading: isUpdating }] = useUpdateSocialMutation();

  const {
    data: editingSocial,
    isLoading: isLoadingDetail,
    isFetching: isFetchingDetail,
    isError: isDetailError,
    error: detailError,
  } = useGetSocialByIdQuery(editId!, {
    skip: mode !== "edit" || !editId,
  });

  useEffect(() => {
    if (mode !== "edit" || !isDetailError) return;
    toast.error(getApiErrorMessage(detailError, "Не удалось загрузить соцсеть"));
    setMode("list");
    setEditId(null);
  }, [mode, isDetailError, detailError]);

  const closeForm = () => {
    setMode("list");
    setEditId(null);
  };

  const handleSubmit = async (data: SocialFormData) => {
    try {
      if (mode === "edit" && editId) {
        await updateSocial({ id: editId, data }).unwrap();
        toast.success("Соцсеть обновлена");
      } else {
        await createSocial(data).unwrap();
        toast.success("Соцсеть создана");
      }
      closeForm();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Ошибка при сохранении"));
    }
  };

  const showForm = mode === "create" || mode === "edit";
  const detailPending =
    mode === "edit" && (isLoadingDetail || isFetchingDetail) && !editingSocial;

  const pageTitle =
    mode === "edit"
      ? "Редактирование соцсети"
      : mode === "create"
        ? "Новая соцсеть"
        : "Управление соцсетями";

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
              Добавить соцсеть
            </button>
          </>
        )}
      </div>

      {showForm ? (
        detailPending ? (
          <div className="card">
            <div className="loading">Загрузка соцсети...</div>
          </div>
        ) : (
          <SocialForm
            key={mode === "edit" ? editId || "edit" : "create"}
            initialData={mode === "edit" ? editingSocial : undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isLoading={isCreating || isUpdating}
          />
        )
      ) : (
        <SocialsTable
          onEdit={(social) => {
            setEditId(social.id);
            setMode("edit");
          }}
        />
      )}
    </div>
  );
};
