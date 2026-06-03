import React, { createContext, useContext, useMemo, useState } from "react";

const WrappedPlayerContext = createContext(null);

export function WrappedPlayerProvider({ children }) {
  const [isPlayerActive, setPlayerActive] = useState(false);

  const value = useMemo(
    () => ({
      isPlayerActive,
      setPlayerActive
    }),
    [isPlayerActive]
  );

  return <WrappedPlayerContext.Provider value={value}>{children}</WrappedPlayerContext.Provider>;
}

export function useWrappedPlayer() {
  const ctx = useContext(WrappedPlayerContext);
  if (!ctx) {
    throw new Error("useWrappedPlayer must be used within WrappedPlayerProvider");
  }
  return ctx;
}
