import React, { createContext, useState, useContext } from 'react';
import { SelectedLocation } from '@/app/(protected)/(tabs)/(mapstack)';

interface SelectedLocationContextType {
  selectedLocation: SelectedLocation | null;
  setSelectedLocation: (location: SelectedLocation | null) => void;
}

export const SelectedLocationContext = createContext<SelectedLocationContextType>({
  selectedLocation: null,
  setSelectedLocation: () => {},
});

export function SelectedLocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);

  return (
    <SelectedLocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </SelectedLocationContext.Provider>
  );
}

export function useSelectedLocation() {
  const context = useContext(SelectedLocationContext);
  if (context === undefined) {
    throw new Error('useSelectedLocation must be used within a SelectedLocationProvider');
  }
  return context;
} 