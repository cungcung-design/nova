export function createCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  const escapeValue = (value: unknown) => {
    const stringValue =
      value === null || value === undefined ? "" : String(value);

    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const headerRow = headers.map(escapeValue).join(",");

  const dataRows = rows.map((row) =>
    headers.map((header) => escapeValue(row[header])).join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}
