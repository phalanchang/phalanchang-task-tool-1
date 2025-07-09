import React, { createContext, useContext, useCallback, useState } from 'react';

interface DailyTaskContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DailyTaskContext = createContext<DailyTaskContextType | undefined>(undefined);

export const DailyTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <DailyTaskContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DailyTaskContext.Provider>
  );
};

export const useDailyTaskRefresh = () => {
  const context = useContext(DailyTaskContext);
  if (context === undefined) {
    throw new Error('useDailyTaskRefresh must be used within a DailyTaskProvider');
  }
  return context;
};