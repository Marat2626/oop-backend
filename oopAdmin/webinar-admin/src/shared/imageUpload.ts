export const ALLOWED_IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,.svg";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const ALLOWED_IMAGE_ERROR =
  "Можно загружать только JPEG, PNG, GIF, WEBP или SVG";

export const ALLOWED_IMAGE_HINT =
  "Поддерживаются JPEG, PNG, GIF, WEBP, SVG до 5MB";

export const isAllowedImageFile = (file: File): boolean => {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true;
  return file.name.toLowerCase().endsWith(".svg");
};
