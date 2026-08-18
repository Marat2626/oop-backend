import { useEffect } from "react";
import styles from "./WebinarModal.module.css";
import { asset } from "../../utils/asset.js";
import { normalizeUrl } from "../../utils/mediaUrl.js";

/**
 * @param {{
 *   webinar: {
 *     title?: string;
 *     date?: string;
 *     time?: string;
 *     talkPoints?: string[];
 *     videoLinks?: { label: string; url: string }[];
 *     expert?: { name?: string; photo?: string; position?: string; organization?: string } | null;
 *   } | null;
 *   isPast?: boolean;
 *   onClose: () => void;
 * }} props
 */
export default function WebinarModal({ webinar, isPast = true, onClose }) {
  useEffect(() => {
    if (!webinar) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [webinar, onClose]);

  if (!webinar) return null;

  const expert = webinar.expert;
  const expertRole = [expert?.position, expert?.organization]
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .join(", ");
  const talkPoints = Array.isArray(webinar.talkPoints)
    ? webinar.talkPoints.filter(Boolean)
    : [];
  const videoLinks = Array.isArray(webinar.videoLinks)
    ? webinar.videoLinks.filter((link) => link?.label && link?.url)
    : [];
  const showSchedule = !isPast && (webinar.date || webinar.time);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={webinar.title || "Вебинар"}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Закрыть"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {showSchedule && (
          <div className={styles.badges}>
            {webinar.date && (
              <span className={styles.badge}>
                <img src={asset("/Calendar.svg")} alt="" />
                {webinar.date}
              </span>
            )}
            {webinar.time && (
              <span className={styles.badge}>
                <img src={asset("/Clock.svg")} alt="" />
                {webinar.time}
              </span>
            )}
          </div>
        )}

        <h2 className={styles.title}>{webinar.title}</h2>

        {expert?.name && (
          <div className={styles.expert}>
            {expert.photo ? (
              <img
                className={styles.expertPhoto}
                src={expert.photo}
                alt={expert.name}
              />
            ) : (
              <div className={styles.expertPhotoPlaceholder} />
            )}
            <div className={styles.expertInfo}>
              <p className={styles.expertName}>{expert.name}</p>
              {expertRole && (
                <p className={styles.expertRole}>{expertRole}</p>
              )}
            </div>
          </div>
        )}

        {talkPoints.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>О чем поговорим</h3>
            <ul className={styles.list}>
              {talkPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {videoLinks.length > 0 && (
          <div className={styles.links}>
            {videoLinks.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={normalizeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
