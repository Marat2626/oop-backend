/** Путь к файлу из public/ (работает на вложенных маршрутах и GitHub Pages). */
export function asset(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${process.env.PUBLIC_URL || ""}${normalized}`;
}
