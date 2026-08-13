import { mediaUrl } from "./mediaUrl.js";
import { mapWebinarModal } from "./mapWebinar.js";

export function mapExpertToCard(expert) {
  const webinars = Array.isArray(expert.webinars) ? expert.webinars : [];
  const modals = webinars.map(mapWebinarModal).filter(Boolean);
  const primaryWebinar = webinars[0] || null;
  const primaryModal = modals[0] || null;
  const webinarTitle = (primaryWebinar?.title || "").trim();

  return {
    id: expert.id,
    name: expert.name || "",
    organization: expert.organization || "",
    role: expert.position || "",
    photo: mediaUrl(expert.photo),
    buttonText: "Вебинар",
    footerText: webinarTitle,
    modal: primaryModal,
    webinars: modals,
  };
}
