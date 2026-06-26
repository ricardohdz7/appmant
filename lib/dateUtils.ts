export function formatDate(date: Date | string | undefined, locale: string = "es-SV"): string {
  if (!date) return "-";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch (e) {
    return "-";
  }
}

export function toDate(date: Date | string | undefined): Date | null {
  if (!date) return null;
  try {
    return typeof date === "string" ? new Date(date) : date;
  } catch (e) {
    return null;
  }
}
