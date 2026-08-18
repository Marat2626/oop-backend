import { useNavigate, useParams } from "react-router-dom";
import { ExpertForm } from "../components/ExpertForm";
import {
  useGetExpertByIdQuery,
  useUpdateExpertMutation,
} from "../api/expertsApi";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ExpertFormData } from "../types";
import { getApiErrorMessage } from "../../../shared/apiError";

export const ExpertEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: expert, isLoading: isLoadingExpert } = useGetExpertByIdQuery(
    id!,
  );
  const [updateExpert, { isLoading: isUpdating }] = useUpdateExpertMutation();

  const handleSubmit = async (data: ExpertFormData) => {
    if (!id) return;
    try {
      await updateExpert({ id, data }).unwrap();
      toast.success("Эксперт успешно обновлен");
      navigate("/experts");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Ошибка при обновлении эксперта"));
    }
  };

  if (isLoadingExpert) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!expert) {
    return <div className="text-red">Эксперт не найден</div>;
  }

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => navigate("/experts")}
          className="btn btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <ArrowLeft size={18} />
          Назад
        </button>
        <h1 className="page-title">Редактирование эксперта</h1>
      </div>

      <ExpertForm
        initialData={expert}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/experts")}
        isLoading={isUpdating}
      />
    </div>
  );
};
