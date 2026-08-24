export function toStringRecord(
  filters: Record<string, unknown> | null | undefined,
) {
  const record: Record<string, string> = {};

  if (!filters) {
    return record;
  }

  for (const [key, value] of Object.entries(filters)) {
    if (value == null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      const joined = value
        .filter((item) => item != null && item !== "")
        .map(String)
        .join(",");

      if (joined) {
        record[key] = joined;
      }

      continue;
    }

    record[key] = String(value);
  }

  return record;
}

export function getFilterString(
  filters: Record<string, unknown>,
  key: string,
) {
  const value = filters[key];

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

export function getFilterNumber(
  filters: Record<string, unknown>,
  key: string,
) {
  const value = filters[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function getFilterStringList(
  filters: Record<string, unknown>,
  key: string,
) {
  const value = filters[key];

  if (Array.isArray(value)) {
    const items = value.map(String).map((item) => item.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  }

  if (typeof value === "string" && value.trim()) {
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  }

  return undefined;
}
