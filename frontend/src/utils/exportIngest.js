import { unzip } from "fflate";

/** Soft warning in UI; hard reject above this. */
export const ZIP_SIZE_WARN_BYTES = 200 * 1024 * 1024;
export const ZIP_SIZE_MAX_BYTES = 600 * 1024 * 1024;

const EXPORT_MARKERS = ["your_instagram_activity/", "personal_information/"];

function normalizeZipEntryPath(rawPath) {
  return String(rawPath || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
}

function isIgnorableZipPath(path) {
  const p = path.toLowerCase();
  return (
    !path ||
    p.endsWith("/") ||
    p.includes("__macosx/") ||
    p.endsWith(".ds_store") ||
    p.split("/").some((seg) => seg.startsWith("."))
  );
}

function filePath(file) {
  return file.webkitRelativePath || file.name || "";
}

/**
 * @param {File[]} files
 */
export function looksLikeInstagramExport(files) {
  if (!files?.length) {
    return false;
  }
  return files.some((f) => {
    const path = filePath(f).toLowerCase();
    return EXPORT_MARKERS.some((marker) => path.includes(marker));
  });
}

/**
 * @param {FileList | File[] | null | undefined} fileList
 * @param {{ onProgress?: (message: string) => void }} [options]
 * @returns {Promise<{ files: File[], source: "folder" | "zip" | null, warning?: string }>}
 */
export async function normalizeExportInput(fileList, options = {}) {
  const { onProgress } = options;
  const arr = Array.from(fileList || []);
  if (arr.length === 0) {
    return { files: [], source: null };
  }

  const zipFile = detectSingleZipUpload(arr);
  if (zipFile) {
    onProgress?.("Reading ZIP…");
    const { files, warning } = await unzipInstagramExport(zipFile, { onProgress });
    if (!looksLikeInstagramExport(files)) {
      throw new Error(
        "This ZIP doesn't look like an Instagram export. Choose the JSON export from Instagram (Accounts Center → Export your information)."
      );
    }
    return { files, source: "zip", warning };
  }

  const folderFiles = arr.filter((f) => filePath(f).includes("/") || arr.length > 1);
  const files = folderFiles.length > 0 ? folderFiles : arr;
  if (!looksLikeInstagramExport(files)) {
    throw new Error(
      "This folder doesn't look like an Instagram export. Pick the unzipped folder that contains your_instagram_activity (or upload the .zip from Instagram)."
    );
  }
  return { files, source: "folder" };
}

/**
 * @param {File[]} arr
 * @returns {File | null}
 */
function detectSingleZipUpload(arr) {
  if (arr.length !== 1) {
    return null;
  }
  const file = arr[0];
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed") {
    return file;
  }
  return null;
}

/**
 * @param {File} zipFile
 * @param {{ onProgress?: (message: string) => void }} [options]
 */
async function unzipInstagramExport(zipFile, options = {}) {
  const { onProgress } = options;
  if (zipFile.size > ZIP_SIZE_MAX_BYTES) {
    throw new Error(
      `This ZIP is too large (${formatMb(zipFile.size)}). Try exporting without media, or unzip on your device and choose the folder instead.`
    );
  }

  let warning;
  if (zipFile.size > ZIP_SIZE_WARN_BYTES) {
    warning = `Large export (${formatMb(zipFile.size)}). Unzipping may take a minute on your phone.`;
  }

  onProgress?.("Unzipping JSON files…");
  const buffer = await zipFile.arrayBuffer();
  const archive = await new Promise((resolve, reject) => {
    unzip(new Uint8Array(buffer), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  const files = [];
  const paths = Object.keys(archive).filter((p) => !isIgnorableZipPath(normalizeZipEntryPath(p)));
  let jsonCount = 0;

  for (const rawPath of paths) {
    const path = normalizeZipEntryPath(rawPath);
    if (!path.toLowerCase().endsWith(".json")) {
      continue;
    }
    const bytes = archive[rawPath];
    if (!bytes?.length) {
      continue;
    }
    const name = path.split("/").pop() || "export.json";
    const file = new File([bytes], name, { type: "application/json" });
    Object.defineProperty(file, "webkitRelativePath", {
      value: path,
      configurable: true
    });
    files.push(file);
    jsonCount += 1;
    if (jsonCount % 200 === 0) {
      onProgress?.(`Unzipping… ${jsonCount} JSON files`);
    }
  }

  if (files.length === 0) {
    throw new Error("No JSON files found in this ZIP. Make sure you exported in JSON format from Instagram.");
  }

  onProgress?.(`Ready — ${files.length} JSON files`);
  return { files, warning };
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
