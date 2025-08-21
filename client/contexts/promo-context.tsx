"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PromoContextType {
  isPromoVisible: boolean;
  setIsPromoVisible: (isVisible: boolean) => void;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export function PromoProvider({ children }: { children: ReactNode }) {
  const [isPromoVisible, setIsPromoVisible] = useState(false);

  return (
    <PromoContext.Provider value={{ isPromoVisible, setIsPromoVisible }}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  const context = useContext(PromoContext);
  if (context === undefined) {
    throw new Error('usePromo must be used within a PromoProvider');
  }
  return context;
}
