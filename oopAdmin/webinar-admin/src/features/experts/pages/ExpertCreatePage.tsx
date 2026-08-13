import { useNavigate } from "react-router-dom";
import { ExpertForm } from "../components/ExpertForm";
import { useCreateExpertMutation } from "../api/expertsApi";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ExpertFormData } from "../types";
import { getApiErrorMessage } from "../../../shared/apiError";

export const ExpertCreatePage = () => {
  const navigate = useNavigate();
  const [createExpert, { isLoading }] = useCreateExpertMutation();

  const handleSubmit = async (data: ExpertFormData) => {
    try {
      await createExpert(data).unwrap();
      toast.success("Эксперт успешно создан");
      navigate("/experts");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Ошибка при создании эксперта"));
    }
  };

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
        <h1 className="page-title">Создание эксперта</h1>
      </div>

      <ExpertForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/experts")}
        isLoading={isLoading}
      />
    </div>
  );
};
