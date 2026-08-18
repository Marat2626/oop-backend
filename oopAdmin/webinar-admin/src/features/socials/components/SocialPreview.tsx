import { X } from "lucide-react";
import { SocialFormData } from "../types";
import "./SocialPreview.css";
import { mediaUrl } from "../../../shared/baseQuery";

interface SocialPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: SocialFormData;
}

const getFullIconUrl = (iconUrl: string) => mediaUrl(iconUrl);

export const SocialPreview = ({
  isOpen,
  onClose,
  data,
}: SocialPreviewProps) => {
  if (!isOpen) return null;

  const iconUrl = getFullIconUrl(data.icon);

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="preview-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="preview-title">Предпросмотр карточки соцсети</h2>

        <div className="social-preview-section">
          <div className="social-preview-heading">
            <p className="social-preview-site-title">
              Где смотреть наши вебинары
            </p>
            <p className="social-preview-site-subtitle">
              Подписывайтесь на наши платформы, чтобы не пропустить новые
              вебинары, интервью и подкасты
            </p>
          </div>

          <div className="social-preview-card-wrap">
            {data.url ? (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social__img__container social__img__link"
              >
                {iconUrl ? (
                  <img
                    className="social__img"
                    src={iconUrl}
                    alt={data.name || "Иконка соцсети"}
                  />
                ) : (
                  <span className="social-preview-placeholder">
                    Загрузите иконку
                  </span>
                )}
              </a>
            ) : (
              <div className="social__img__container">
                {iconUrl ? (
                  <img
                    className="social__img"
                    src={iconUrl}
                    alt={data.name || "Иконка соцсети"}
                  />
                ) : (
                  <span className="social-preview-placeholder">
                    Загрузите иконку
                  </span>
                )}
              </div>
            )}
            {data.name && (
              <p className="social-preview-name">{data.name}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
