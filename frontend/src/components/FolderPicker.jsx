import React, { useEffect, useRef } from "react";
import { useExportData } from "../context/ExportDataContext.jsx";

export default function FolderPicker({ onFilesReady }) {
  const { files, setFiles } = useExportData();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (files && !notifiedRef.current) {
      notifiedRef.current = true;
      onFilesReady?.(files);
    }
  }, [files, onFilesReady]);

  async function handleChange(event) {
    notifiedRef.current = false;
    await setFiles(event.target.files);
  }

  if (files) {
    return (
      <div className="folder-picker-loaded">
        <span className="folder-picker-loaded__text">
          Data loaded ({files.length} files)
        </span>
        <label className="folder-picker-loaded__change">
          Change folder
          <input
            type="file"
            directory=""
            webkitdirectory=""
            multiple
            onChange={handleChange}
            className="folder-picker-loaded__input"
          />
        </label>
      </div>
    );
  }

  return (
    <label>
      Upload export folder
      <input
        type="file"
        directory=""
        webkitdirectory=""
        multiple
        onChange={handleChange}
      />
    </label>
  );
}
