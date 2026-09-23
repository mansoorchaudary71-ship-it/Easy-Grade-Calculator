import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToolKey, UnifiedHistoryItem } from '../types';
import { LOCAL_STORAGE_HISTORY_KEY } from '../data/constants';

export const UNIFIED_HISTORY_STORAGE_KEY = 'easy_grade_all_calculators_history';

interface HistoryContextValue {
  history: UnifiedHistoryItem[];
  addHistoryItem: (item: Omit<UnifiedHistoryItem, 'id' | 'timestamp'>) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: (typeFilter?: ToolKey) => void;
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  openSidePanel: () => void;
  closeSidePanel: () => void;
  toggleSidePanel: () => void;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<UnifiedHistoryItem[]>([]);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(UNIFIED_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } else {
        // Check for migration from existing quick-grade history if available
        const oldQuickGrade = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
        if (oldQuickGrade) {
          const parsedOld = JSON.parse(oldQuickGrade);
          if (Array.isArray(parsedOld) && parsedOld.length > 0) {
            const migrated: UnifiedHistoryItem[] = parsedOld.map((item: any) => ({
              id: `migrated_${item.id || Date.now()}`,
              type: 'quick' as ToolKey,
              title: 'Grade Calculation',
              value: `${item.percent?.toFixed(1)}% (${item.letter})`,
              subtitle: `${item.mode === 'weighted' ? 'Weighted' : 'Points'} mode · ${item.count || 3} assessments`,
              timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
            }));
            setHistory(migrated);
            localStorage.setItem(UNIFIED_HISTORY_STORAGE_KEY, JSON.stringify(migrated));
          }
        }
      }
    } catch (e) {
      console.warn('Could not read calculation history from storage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when history changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(UNIFIED_HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save calculation history to storage:', e);
    }
  }, [history, isInitialized]);

  const addHistoryItem = (item: Omit<UnifiedHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: UnifiedHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Prevent rapid duplicate insertions if same type and same value within last 3 seconds
      if (prev.length > 0) {
        const first = prev[0];
        if (
          first.type === newItem.type &&
          first.value === newItem.value &&
          first.subtitle === newItem.subtitle &&
          Date.now() - first.timestamp < 3000
        ) {
          return prev;
        }
      }
      return [newItem, ...prev].slice(0, 60); // Keep last 60 items
    });
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = (typeFilter?: ToolKey) => {
    if (typeFilter) {
      setHistory((prev) => prev.filter((item) => item.type !== typeFilter));
    } else {
      setHistory([]);
    }
  };

  const openSidePanel = () => setIsSidePanelOpen(true);
  const closeSidePanel = () => setIsSidePanelOpen(false);
  const toggleSidePanel = () => setIsSidePanelOpen((prev) => !prev);

  return (
    <HistoryContext.Provider
      value={{
        history,
        addHistoryItem,
        removeHistoryItem,
        clearHistory,
        isSidePanelOpen,
        setIsSidePanelOpen,
        openSidePanel,
        closeSidePanel,
        toggleSidePanel,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextValue => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
