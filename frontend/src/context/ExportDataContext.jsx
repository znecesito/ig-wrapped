import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { parsePersonalInformationUsername } from "../utils/socialInteractionGraph.js";

const ExportDataContext = createContext(null);

export function ExportDataProvider({ children }) {
  const [files, setFilesRaw] = useState(null);
  const [detectedUsername, setDetectedUsername] = useState(null);

  const [heatmapCache, setHeatmapCache] = useState(null);
  const [socialGraphCache, setSocialGraphCache] = useState(null);
  const [messagesCache, setMessagesCache] = useState(null);
  const [wordsCache, setWordsCache] = useState(null);

  const setFiles = useCallback(async (fileList) => {
    const arr = Array.from(fileList || []);
    if (arr.length === 0) {
      setFilesRaw(null);
      setDetectedUsername(null);
      setHeatmapCache(null);
      setSocialGraphCache(null);
      setMessagesCache(null);
      setWordsCache(null);
      return;
    }

    setFilesRaw(arr);
    setHeatmapCache(null);
    setSocialGraphCache(null);
    setMessagesCache(null);
    setWordsCache(null);

    const pi = await parsePersonalInformationUsername(arr);
    setDetectedUsername(pi.username);
  }, []);

  const clearFiles = useCallback(() => {
    setFilesRaw(null);
    setDetectedUsername(null);
    setHeatmapCache(null);
    setSocialGraphCache(null);
    setMessagesCache(null);
    setWordsCache(null);
  }, []);

  const value = useMemo(
    () => ({
      files,
      detectedUsername,
      setFiles,
      clearFiles,
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
      detectedUsername,
      setFiles,
      clearFiles,
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
