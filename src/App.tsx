import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GradeCalculator } from './components/GradeCalculator';
import { GpaCalculator } from './components/GpaCalculator';
import { TipCalculator } from './components/TipCalculator';
import { PercentageCalculator } from './components/PercentageCalculator';
import { LoanCalculator } from './components/LoanCalculator';
import { MortgageCalculator } from './components/MortgageCalculator';
import { PasswordGenerator } from './components/PasswordGenerator';
import { EducationalGuide } from './components/EducationalGuide';
import { Toast } from './components/Toast';
import { HistorySidePanel } from './components/HistorySidePanel';
import { HistoryProvider, useHistory } from './context/HistoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { TOOLS_LIST } from './data/constants';
import { ToolKey } from './types';
import { History } from 'lucide-react';

const FloatingHistoryTrigger: React.FC = () => {
  const { history, toggleSidePanel } = useHistory();

  return (
    <button
      type="button"
      className="history-floating-btn"
      onClick={toggleSidePanel}
      aria-label="Open calculation history"
      title="Open calculation history"
    >
      <History aria-hidden="true" />
      <span>History</span>
      {history.length > 0 && (
        <span className="floating-count-badge">{history.length}</span>
      )}
    </button>
  );
};

function AppMain() {
  const [activeTool, setActiveTool] = useState<ToolKey>('quick');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Auto-dismiss toast after 2.6 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const currentToolDef =
    TOOLS_LIST.find((t) => t.key === activeTool) ?? TOOLS_LIST[0];
  const CurrentIcon = currentToolDef.icon;

  return (
    <div className={`app-shell tool-theme-${activeTool}`}>
      <Navbar activeTool={activeTool} onSelectTool={setActiveTool} />

      <main className={`main-wrap tool-theme-${activeTool}`}>
        {activeTool === 'quick' && <GradeCalculator setToast={setToastMessage} />}
        {activeTool === 'gpa' && <GpaCalculator setToast={setToastMessage} />}
        {activeTool === 'tip' && <TipCalculator setToast={setToastMessage} />}
        {activeTool === 'percentage' && <PercentageCalculator setToast={setToastMessage} />}
        {activeTool === 'loan' && <LoanCalculator setToast={setToastMessage} />}
        {activeTool === 'mortgage' && <MortgageCalculator setToast={setToastMessage} />}
        {activeTool === 'password' && (
          <PasswordGenerator setToast={setToastMessage} />
        )}

        <div className="active-tool-footnote">
          <CurrentIcon aria-hidden="true" />
          <span>
            You&apos;re using <strong>{currentToolDef.label}</strong>. Switch tools anytime from the navigation above.
          </span>
        </div>

        <EducationalGuide />
      </main>

      <HistorySidePanel setToast={setToastMessage} onSelectTool={setActiveTool} />
      <FloatingHistoryTrigger />
      <Toast message={toastMessage} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <AppMain />
      </HistoryProvider>
    </ThemeProvider>
  );
}

