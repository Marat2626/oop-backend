import { useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Social } from "../types";
import { useGetSocialsQuery, useDeleteSocialMutation } from "../api/socialsApi";
import { toast } from "sonner";
import { mediaUrl } from "../../../shared/baseQuery";

interface Props {
  onEdit: (social: Social) => void;
}

const formatUrlLabel = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.host}${path}`.replace(/\/$/, "");
  } catch {
    return url;
  }
};

export const SocialsTable = ({ onEdit }: Props) => {
  const { data: socials, isLoading, error } = useGetSocialsQuery();
  const [deleteSocial] = useDeleteSocialMutation();
  const [search, setSearch] = useState("");

  const handleDelete = async (id: string) => {
    if (window.confirm("Удалить соцсеть?")) {
      try {
        await deleteSocial(id).unwrap();
        toast.success("Соцсеть удалена");
      } catch {
        toast.error("Ошибка при удалении");
      }
    }
  };

  const safeSocials = Array.isArray(socials) ? socials : [];

  const filteredSocials = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return safeSocials;
    return safeSocials.filter((social) => {
      const haystack = [social.name, social.url].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [safeSocials, search]);

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="text-red">Ошибка загрузки соцсетей</div>;

  return (
    <div>
      <div className="filters">
        <input
          type="search"
          className="input"
          placeholder="Поиск по названию или ссылке..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 280, flex: "1 1 280px" }}
        />
      </div>

      {safeSocials.length === 0 ? (
        <div
          className="text-center"
          style={{ padding: "2rem", color: "#8e8e93" }}
        >
          Нет соцсетей. Нажмите «Добавить соцсеть», чтобы создать.
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Иконка</th>
                <th>Название</th>
                <th>Ссылка</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredSocials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Ничего не найдено по запросу «{search.trim()}»
                  </td>
                </tr>
              ) : (
                filteredSocials.map((social) => (
                  <tr key={social.id}>
                    <td>
                      {social.icon ? (
                        <img
                          src={mediaUrl(social.icon)}
                          alt={social.name}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "contain",
                            borderRadius: 8,
                            background: "#f5f5f7",
                            padding: 4,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: "#e5e5ea",
                          }}
                          aria-hidden
                        />
                      )}
                    </td>
                    <td
                      className="text-blue cursor-pointer"
                      onClick={() => onEdit(social)}
                    >
                      {social.name}
                    </td>
                    <td>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue"
                        style={{ fontSize: "0.875rem" }}
                        title={social.url}
                      >
                        {formatUrlLabel(social.url)}
                      </a>
                    </td>
                    <td className="action-buttons">
                      <button
                        type="button"
                        onClick={() => onEdit(social)}
                        className="icon-button icon-edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(social.id)}
                        className="icon-button icon-delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
