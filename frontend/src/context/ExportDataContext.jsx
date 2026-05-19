import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { normalizeExportInput } from "../utils/exportIngest.js";
import { parsePersonalInformationUsername } from "../utils/socialInteractionGraph.js";

const ExportDataContext = createContext(null);

export function ExportDataProvider({ children }) {
  const [files, setFilesRaw] = useState(null);
  const [exportSource, setExportSource] = useState(null);
  const [detectedUsername, setDetectedUsername] = useState(null);

  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestProgress, setIngestProgress] = useState("");
  const [ingestError, setIngestError] = useState("");
  const [ingestWarning, setIngestWarning] = useState("");

  const [heatmapCache, setHeatmapCache] = useState(null);
  const [socialGraphCache, setSocialGraphCache] = useState(null);
  const [messagesCache, setMessagesCache] = useState(null);
  const [wordsCache, setWordsCache] = useState(null);

  const clearCaches = useCallback(() => {
    setHeatmapCache(null);
    setSocialGraphCache(null);
    setMessagesCache(null);
    setWordsCache(null);
  }, []);

  const loadExport = useCallback(
    async (fileList) => {
      const arr = Array.from(fileList || []);
      if (arr.length === 0) {
        return;
      }

      setIngestLoading(true);
      setIngestError("");
      setIngestWarning("");
      setIngestProgress("Checking export…");

      try {
        const { files: normalized, source, warning } = await normalizeExportInput(arr, {
          onProgress: setIngestProgress
        });

        setFilesRaw(normalized);
        setExportSource(source);
        setIngestWarning(warning || "");
        clearCaches();

        setIngestProgress("Detecting profile…");
        const pi = await parsePersonalInformationUsername(normalized);
        setDetectedUsername(pi.username);
        setIngestProgress("");
      } catch (err) {
        setIngestError(err?.message || "Could not read this export.");
        setIngestProgress("");
      } finally {
        setIngestLoading(false);
      }
    },
    [clearCaches]
  );

  /** @deprecated Use loadExport — kept for pages that still call setFiles */
  const setFiles = loadExport;

  const clearFiles = useCallback(() => {
    setFilesRaw(null);
    setExportSource(null);
    setDetectedUsername(null);
    setIngestError("");
    setIngestWarning("");
    setIngestProgress("");
    clearCaches();
  }, [clearCaches]);

  const value = useMemo(
    () => ({
      files,
      exportSource,
      detectedUsername,
      setFiles,
      loadExport,
      clearFiles,
      ingestLoading,
      ingestProgress,
      ingestError,
      ingestWarning,
      heatmapCache,
      setHeatmapCache,
      socialGraphCache,
      setSocialGraphCache,
      messagesCache,
      setMessagesCache,
      wordsCache,
      setWordsCache
    }),
    [
      files,
      exportSource,
      detectedUsername,
      setFiles,
      loadExport,
      clearFiles,
      ingestLoading,
      ingestProgress,
      ingestError,
      ingestWarning,
      heatmapCache,
      socialGraphCache,
      messagesCache,
      wordsCache
    ]
  );

  return (
    <ExportDataContext.Provider value={value}>
      {children}
    </ExportDataContext.Provider>
  );
}

export function useExportData() {
  const ctx = useContext(ExportDataContext);
  if (!ctx) {
    throw new Error("useExportData must be used within an ExportDataProvider");
  }
  return ctx;
}
