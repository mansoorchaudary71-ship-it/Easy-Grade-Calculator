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
              details: {
                score: item.percent,
                letter: item.letter,
                mode: item.mode,
              },
              timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
            }));
            setHistory(migrated);
            localStorage.setItem(UNIFIED_HISTORY_STORAGE_KEY, JSON.stringify(migrated));
          }
        } else {
          // Provide realistic starter calculations so the Recharts trend visualizer immediately renders
          const now = Date.now();
          const day = 24 * 60 * 60 * 1000;
          const starterHistory: UnifiedHistoryItem[] = [
            {
              id: 'starter_1',
              type: 'quick',
              title: 'Grade Calculation',
              value: '82.5% (B)',
              subtitle: 'Biology 101 · Points mode · 3 assessments',
              details: { score: 82.5, letter: 'B', mode: 'points' },
              timestamp: now - 12 * day,
            },
            {
              id: 'starter_2',
              type: 'gpa',
              title: 'GPA Calculation',
              value: '3.35 / 4.0',
              subtitle: '4 courses · 14.0 credits',
              details: { score: 3.35, gpa: 3.35, credits: 14 },
              timestamp: now - 9 * day,
            },
            {
              id: 'starter_3',
              type: 'quick',
              title: 'Grade Calculation',
              value: '88.4% (B+)',
              subtitle: 'Calculus II · Weighted mode · 4 assessments',
              details: { score: 88.4, letter: 'B+', mode: 'weighted' },
              timestamp: now - 6 * day,
            },
            {
              id: 'starter_4',
              type: 'gpa',
              title: 'GPA Calculation',
              value: '3.62 / 4.0',
              subtitle: '5 courses · 16.0 credits',
              details: { score: 3.62, gpa: 3.62, credits: 16 },
              timestamp: now - 3 * day,
            },
            {
              id: 'starter_5',
              type: 'quick',
              title: 'Grade Calculation',
              value: '91.8% (A-)',
              subtitle: 'Biology 101 · Weighted mode · 5 assessments',
              details: { score: 91.8, letter: 'A-', mode: 'weighted' },
              timestamp: now - 1 * day,
            },
          ];
          setHistory(starterHistory);
          localStorage.setItem(UNIFIED_HISTORY_STORAGE_KEY, JSON.stringify(starterHistory));
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
