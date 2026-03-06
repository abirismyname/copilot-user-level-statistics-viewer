"use client";

import React from 'react';
import { MetricsProvider } from '../components/MetricsContext';
import { NavigationProvider } from '../state/NavigationContext';
import { TeamLookupContextProvider } from '../components/TeamLookupContext';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationProvider>
      <MetricsProvider>
        <TeamLookupContextProvider>
          {children}
        </TeamLookupContextProvider>
      </MetricsProvider>
    </NavigationProvider>
  );
};

export default Providers;
