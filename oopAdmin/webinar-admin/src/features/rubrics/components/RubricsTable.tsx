import { useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Rubric } from "../types";
import {
  useGetRubricsQuery,
  useDeleteRubricMutation,
} from "../api/rubricsApi";
import { useGetWebinarsQuery } from "../../webinars/api/webinarsApi";

interface Props {
  onEdit: (rubric: Rubric) => void;
}

export const RubricsTable = ({ onEdit }: Props) => {
  const { data: rubrics, isLoading, error } = useGetRubricsQuery();
  const { data: webinars = [] } = useGetWebinarsQuery();
  const [deleteRubric] = useDeleteRubricMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const webinarCountByRubric = useMemo(() => {
    const map = new Map<number, number>();
    webinars.forEach((webinar) => {
      (webinar.rubric_ids || []).forEach((rubricId) => {
        map.set(rubricId, (map.get(rubricId) || 0) + 1);
      });
    });
    return map;
  }, [webinars]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить рубрику?")) return;
    try {
      setDeletingId(id);
      await deleteRubric(id).unwrap();
      toast.success("Рубрика удалена");
    } catch {
      toast.error("Ошибка при удалении");
    } finally {
      setDeletingId(null);
    }
  };

  const safeRubrics = Array.isArray(rubrics) ? rubrics : [];

  const filteredRubrics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return safeRubrics;
    return safeRubrics.filter((rubric) =>
      rubric.name.toLowerCase().includes(query),
    );
  }, [safeRubrics, search]);

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="text-red">Ошибка загрузки рубрик</div>;

  return (
    <div>
      <div className="filters">
        <input
          type="search"
          className="input"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 280, flex: "1 1 280px" }}
        />
      </div>

      {safeRubrics.length === 0 ? (
        <div
          className="text-center"
          style={{ padding: "2rem", color: "#8e8e93" }}
        >
          Нет рубрик. Нажмите «Добавить рубрику», чтобы создать.
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Название</th>
                <th style={{ width: 120 }}>Вебинары</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredRubrics.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Ничего не найдено по запросу «{search.trim()}»
                  </td>
                </tr>
              ) : (
                filteredRubrics.map((rubric) => {
                  const count =
                    webinarCountByRubric.get(Number(rubric.id)) || 0;
                  return (
                    <tr key={rubric.id}>
                      <td style={{ color: "#8e8e93" }}>{rubric.id}</td>
                      <td>
                        <button
                          type="button"
                          className="text-blue cursor-pointer"
                          onClick={() => onEdit(rubric)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            font: "inherit",
                          }}
                        >
                          {rubric.name}
                        </button>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            count > 0 ? "badge-success" : "badge-muted"
                          }`}
                        >
                          {count}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          type="button"
                          onClick={() => onEdit(rubric)}
                          className="icon-button icon-edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rubric.id)}
                          className="icon-button icon-delete"
                          disabled={deletingId === rubric.id}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
