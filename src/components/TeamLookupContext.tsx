'use client';

import React, { createContext, useContext, useState } from 'react';

interface TeamLookupContextValue {
  teamLookup: Map<string, string>;
  setTeamLookup: (map: Map<string, string>) => void;
  clearTeamLookup: () => void;
}

const TeamLookupContext = createContext<TeamLookupContextValue | null>(null);

export function TeamLookupContextProvider({ children }: { children: React.ReactNode }) {
  const [teamLookup, setTeamLookupState] = useState<Map<string, string>>(new Map());

  const setTeamLookup = (map: Map<string, string>) => {
    setTeamLookupState(map);
  };

  const clearTeamLookup = () => {
    setTeamLookupState(new Map());
  };

  return (
    <TeamLookupContext.Provider value={{ teamLookup, setTeamLookup, clearTeamLookup }}>
      {children}
    </TeamLookupContext.Provider>
  );
}

export function useTeamLookup(): TeamLookupContextValue {
  const ctx = useContext(TeamLookupContext);
  if (!ctx) {
    throw new Error('useTeamLookup must be used within TeamLookupContextProvider');
  }
  return ctx;
}
