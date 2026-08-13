export function getApiErrorMessage(
  error: unknown,
  fallback = "Произошла ошибка",
): string {
  if (!error || typeof error !== "object") return fallback;

  const data = "data" in error ? (error as { data?: unknown }).data : undefined;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail;
    }
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
  }

  if (
    "error" in error &&
    typeof (error as { error?: unknown }).error === "string"
  ) {
    return (error as { error: string }).error;
  }

  return fallback;
}
