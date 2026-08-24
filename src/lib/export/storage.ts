import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const exportRoot = path.join(process.cwd(), ".data", "exports");

export type StoredExport = {
  fileName: string;
  storageKey: string;
};

export async function saveExportFile(
  jobId: string,
  fileName: string,
  contents: string,
): Promise<StoredExport> {
  await mkdir(exportRoot, { recursive: true });

  const storageKey = `${jobId}.csv`;
  const filePath = path.join(exportRoot, storageKey);

  await writeFile(filePath, contents, "utf8");

  return {
    fileName,
    storageKey,
  };
}

export async function readExportFile(storageKey: string) {
  const filePath = path.join(exportRoot, path.basename(storageKey));
  return readFile(filePath);
}
