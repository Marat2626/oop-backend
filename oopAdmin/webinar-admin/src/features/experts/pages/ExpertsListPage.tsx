import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { ExpertsTable } from "../components/ExpertsTable";
import { Expert } from "../types";

export const ExpertsListPage = () => {
  const navigate = useNavigate();

  const handleEdit = (expert: Expert) => {
    navigate(`/experts/edit/${expert.id}`);
  };

  const handleCreate = () => {
    navigate("/experts/create");
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Управление экспертами</h1>
        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={20} />
          Добавить эксперта
        </button>
      </div>

      <ExpertsTable onEdit={handleEdit} />
    </div>
  );
};
