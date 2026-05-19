import React, { useRef } from "react";
import { useExportData } from "../context/ExportDataContext.jsx";

export default function ExportPicker({ onFilesReady }) {
  const {
    files,
    exportSource,
    ingestLoading,
    ingestProgress,
    ingestError,
    ingestWarning,
    loadExport,
    clearFiles
  } = useExportData();

  const zipInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const notifiedRef = useRef(false);

  React.useEffect(() => {
    if (files && !notifiedRef.current) {
      notifiedRef.current = true;
      onFilesReady?.(files);
    }
  }, [files, onFilesReady]);

  async function handlePick(fileList) {
    notifiedRef.current = false;
    await loadExport(fileList);
  }

  function resetInputs() {
    if (zipInputRef.current) {
      zipInputRef.current.value = "";
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  }

  if (files) {
    const sourceLabel =
      exportSource === "zip" ? "ZIP" : exportSource === "folder" ? "folder" : "export";
    return (
      <div className="export-picker export-picker--loaded">
        <p className="export-picker__status">
          <span className="export-picker__status-dot" aria-hidden />
          Data loaded from {sourceLabel} ({files.length} JSON files)
        </p>
        {ingestWarning ? <p className="export-picker__warn">{ingestWarning}</p> : null}
        <div className="export-picker__actions">
          <label className="export-picker__btn">
            Change ZIP
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="export-picker__input"
              disabled={ingestLoading}
              onChange={(e) => {
                resetInputs();
                handlePick(e.target.files);
              }}
            />
          </label>
          <label className="export-picker__btn export-picker__btn--secondary">
            Change folder
            <input
              ref={folderInputRef}
              type="file"
              directory=""
              webkitdirectory=""
              multiple
              className="export-picker__input"
              disabled={ingestLoading}
              onChange={(e) => {
                resetInputs();
                handlePick(e.target.files);
              }}
            />
          </label>
          <button
            type="button"
            className="export-picker__clear"
            disabled={ingestLoading}
            onClick={() => {
              notifiedRef.current = false;
              resetInputs();
              clearFiles();
            }}
          >
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="export-picker">
      <p className="export-picker__hint muted">
        Choose the <strong>.zip</strong> from Instagram (recommended on phone) or the unzipped folder.
      </p>
      <div className="export-picker__actions">
        <label className="export-picker__btn export-picker__btn--primary">
          Choose ZIP
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="export-picker__input"
            disabled={ingestLoading}
            onChange={(e) => handlePick(e.target.files)}
          />
        </label>
        <label className="export-picker__btn export-picker__btn--secondary">
          Choose folder
          <input
            ref={folderInputRef}
            type="file"
            directory=""
            webkitdirectory=""
            multiple
            className="export-picker__input"
            disabled={ingestLoading}
            onChange={(e) => handlePick(e.target.files)}
          />
        </label>
      </div>
      {ingestLoading ? (
        <p className="export-picker__progress" role="status">
          {ingestProgress || "Loading export…"}
        </p>
      ) : null}
      {ingestError ? <div className="error export-picker__error">{ingestError}</div> : null}
    </div>
  );
}
