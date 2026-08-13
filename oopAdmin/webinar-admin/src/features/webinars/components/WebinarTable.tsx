import { useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Webinar } from "../types";
import {
  useGetWebinarsQuery,
  useDeleteWebinarMutation,
} from "../api/webinarsApi";
import { useGetRubricsQuery } from "../../rubrics/api/rubricsApi";
import { useGetExpertsQuery } from "../../experts/api/expertsApi";
import { mediaUrl } from "../../../shared/baseQuery";
import { toast } from "sonner";

interface Props {
  onEdit: (webinar: Webinar) => void;
}

const formatDateRu = (date: string, time: string) => {
  if (!date) return "—";
  const [y, m, d] = date.split("-");
  const datePart = y && m && d ? `${d}.${m}.${y}` : date;
  return time ? `${datePart}, ${time}` : datePart;
};

export const WebinarTable = ({ onEdit }: Props) => {
  const { data: webinars, isLoading, error } = useGetWebinarsQuery();
  const { data: rubrics = [] } = useGetRubricsQuery();
  const { data: experts = [] } = useGetExpertsQuery();
  const [deleteWebinar] = useDeleteWebinarMutation();
  const [rubricFilter, setRubricFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const rubricNameById = useMemo(() => {
    const map = new Map<number, string>();
    rubrics.forEach((rubric) => map.set(Number(rubric.id), rubric.name));
    return map;
  }, [rubrics]);

  const expertNameById = useMemo(() => {
    const map = new Map<string, string>();
    experts.forEach((expert) => map.set(String(expert.id), expert.name));
    return map;
  }, [experts]);

  const safeWebinars = Array.isArray(webinars) ? webinars : [];

  const filteredWebinars = useMemo(() => {
    const query = search.trim().toLowerCase();
    return safeWebinars.filter((w) => {
      if (rubricFilter !== "all" && !w.rubric_ids.includes(Number(rubricFilter))) {
        return false;
      }
      if (statusFilter === "published" && !w.is_published) return false;
      if (statusFilter === "draft" && w.is_published) return false;
      if (query && !w.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [safeWebinars, rubricFilter, statusFilter, search]);

  const formatRubrics = (ids: number[]) => {
    if (!ids.length) return "—";
    return ids.map((id) => rubricNameById.get(id) || `#${id}`).join(", ");
  };

  const resolveExpertName = (webinar: Webinar) => {
    if (webinar.expert_name) return webinar.expert_name;
    if (webinar.expert_id) {
      return expertNameById.get(String(webinar.expert_id)) || "—";
    }
    return "—";
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить вебинар?")) {
      try {
        await deleteWebinar(id).unwrap();
        toast.success("Вебинар удален");
      } catch {
        toast.error("Ошибка при удалении");
      }
    }
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="text-red">Ошибка загрузки</div>;

  return (
    <div>
      <div className="filters">
        <input
          type="search"
          className="input"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 220, flex: "1 1 220px" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          style={{ width: "auto" }}
        >
          <option value="all">Все статусы</option>
          <option value="published">Опубликован</option>
          <option value="draft">Черновик</option>
        </select>
        <select
          value={rubricFilter}
          onChange={(e) => setRubricFilter(e.target.value)}
          className="input"
          style={{ width: "auto" }}
        >
          <option value="all">Все рубрики</option>
          {rubrics.map((rubric) => (
            <option key={rubric.id} value={rubric.id}>
              {rubric.name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>Превью</th>
              <th>Название</th>
              <th>Дата / время</th>
              <th>Эксперт</th>
              <th>Рубрики</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredWebinars.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Нет вебинаров. Нажмите «Добавить вебинар», чтобы создать.
                </td>
              </tr>
            ) : (
              filteredWebinars.map((webinar) => {
                const thumb = webinar.preview || webinar.photo;
                return (
                  <tr key={webinar.id}>
                    <td>
                      {thumb ? (
                        <img
                          src={mediaUrl(thumb)}
                          alt=""
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: "#e5e5ea",
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onEdit(webinar)}
                        className="text-blue cursor-pointer"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          textAlign: "left",
                        }}
                      >
                        {webinar.title}
                      </button>
                    </td>
                    <td>
                      <div>{formatDateRu(webinar.date, webinar.time)}</div>
                      {(webinar.end_date || webinar.end_time) && (
                        <div
                          style={{
                            color: "#8e8e93",
                            fontSize: "0.85rem",
                            marginTop: 2,
                          }}
                        >
                          до {formatDateRu(webinar.end_date, webinar.end_time)}
                        </div>
                      )}
                    </td>
                    <td>{resolveExpertName(webinar)}</td>
                    <td>{formatRubrics(webinar.rubric_ids)}</td>
                    <td>
                      <span
                        className={`badge ${
                          webinar.is_published ? "badge-success" : "badge-muted"
                        }`}
                      >
                        {webinar.is_published ? "Опубликован" : "Черновик"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        type="button"
                        onClick={() => onEdit(webinar)}
                        className="icon-button icon-edit"
                        aria-label="Редактировать"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(webinar.id)}
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
    </div>
  );
};
