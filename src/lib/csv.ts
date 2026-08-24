export function escapeCsvValue(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const stringValue =
    String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(
      /"/g,
      '""',
    )}"`;
  }

  return stringValue;
}

export function createCsv(
  headers: string[],
  rows: unknown[][],
): string {
  const headerLine =
    headers
      .map(escapeCsvValue)
      .join(",");

  const dataLines =
    rows.map((row) =>
      row
        .map(escapeCsvValue)
        .join(","),
    );

  return [
    headerLine,
    ...dataLines,
  ].join("\n");
}
