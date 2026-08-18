import { useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Expert } from "../types";
import { useGetExpertsQuery, useDeleteExpertMutation } from "../api/expertsApi";
import { toast } from "sonner";
import { mediaUrl } from "../../../shared/baseQuery";

interface Props {
  onEdit: (expert: Expert) => void;
}

const countWebinarIds = (raw?: string) =>
  (raw || "")
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean).length;

export const ExpertsTable = ({ onEdit }: Props) => {
  const { data: experts, isLoading, error } = useGetExpertsQuery();
  const [deleteExpert] = useDeleteExpertMutation();
  const [search, setSearch] = useState("");

  const handleDelete = async (id: string) => {
    if (window.confirm("Удалить эксперта?")) {
      try {
        await deleteExpert(id).unwrap();
        toast.success("Эксперт удален");
      } catch {
        toast.error("Ошибка при удалении");
      }
    }
  };

  const safeExperts = Array.isArray(experts) ? experts : [];

  const filteredExperts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return safeExperts;
    return safeExperts.filter((expert) => {
      const haystack = [
        expert.name,
        expert.organization,
        expert.position,
        expert.specialization,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [safeExperts, search]);

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="text-red">Ошибка загрузки экспертов</div>;

  return (
    <div>
      <div className="filters">
        <input
          type="search"
          className="input"
          placeholder="Поиск по ФИО, организации, должности..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 280, flex: "1 1 280px" }}
        />
      </div>

      {safeExperts.length === 0 ? (
        <div
          className="text-center"
          style={{ padding: "2rem", color: "#8e8e93" }}
        >
          Нет экспертов. Нажмите «Добавить эксперта», чтобы создать.
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Фото</th>
                <th>ФИО</th>
                <th>Организация</th>
                <th>Должность</th>
                <th>Специализация</th>
                <th>Вебинары</th>
                <th>Кратко</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    Ничего не найдено по запросу «{search.trim()}»
                  </td>
                </tr>
              ) : (
                filteredExperts.map((expert) => {
                  const webinarCount = countWebinarIds(expert.webinar_ids);
                  const hasShortInfo = Boolean(expert.short_info?.trim());
                  return (
                    <tr key={expert.id}>
                      <td>
                        {expert.photo ? (
                          <img
                            src={mediaUrl(expert.photo)}
                            alt={expert.name}
                            className="image-preview-circle"
                            style={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <div
                            className="image-preview-circle"
                            style={{
                              width: 40,
                              height: 40,
                              background: "#e5e5ea",
                            }}
                            aria-hidden
                          />
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="text-blue cursor-pointer"
                          onClick={() => onEdit(expert)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            textAlign: "left",
                          }}
                        >
                          {expert.name}
                        </button>
                      </td>
                      <td>{expert.organization || "—"}</td>
                      <td>{expert.position || "—"}</td>
                      <td>{expert.specialization || "—"}</td>
                      <td>
                        {webinarCount > 0 ? (
                          <span className="badge">
                            {webinarCount}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            hasShortInfo ? "badge-success" : "badge-muted"
                          }`}
                        >
                          {hasShortInfo ? "Есть" : "Нет"}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          type="button"
                          onClick={() => onEdit(expert)}
                          className="icon-button icon-edit"
                          aria-label="Редактировать"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(expert.id)}
                          className="icon-button icon-delete"
                          aria-label="Удалить"
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
