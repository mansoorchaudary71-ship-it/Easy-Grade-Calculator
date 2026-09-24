import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { GradeCalculator } from './components/GradeCalculator';
import { Toast } from './components/Toast';
import { HistoryProvider, useHistory } from './context/HistoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { TOOLS_LIST } from './data/constants';
import { ToolKey } from './types';
import { History } from 'lucide-react';

// Lazy-load secondary calculators, educational guide, and heavy drawers to optimize critical initial JS payload
const EducationalGuide = lazy(() => import('./components/EducationalGuide').then(m => ({ default: m.EducationalGuide })));
const GpaCalculator = lazy(() => import('./components/GpaCalculator').then(m => ({ default: m.GpaCalculator })));
const TipCalculator = lazy(() => import('./components/TipCalculator').then(m => ({ default: m.TipCalculator })));
const PercentageCalculator = lazy(() => import('./components/PercentageCalculator').then(m => ({ default: m.PercentageCalculator })));
const LoanCalculator = lazy(() => import('./components/LoanCalculator').then(m => ({ default: m.LoanCalculator })));
const MortgageCalculator = lazy(() => import('./components/MortgageCalculator').then(m => ({ default: m.MortgageCalculator })));
const PasswordGenerator = lazy(() => import('./components/PasswordGenerator').then(m => ({ default: m.PasswordGenerator })));
const HistorySidePanel = lazy(() => import('./components/HistorySidePanel').then(m => ({ default: m.HistorySidePanel })));

const ToolLoadingFallback = () => (
  <div style={{ minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid hsl(var(--tool-primary)/0.2)', borderTopColor: 'hsl(var(--tool-primary))', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--app-font-mono)' }}>Loading calculator...</span>
    </div>
  </div>
);

const FloatingHistoryTrigger: React.FC = () => {
  const { history, toggleSidePanel } = useHistory();

  return (
    <button
      type="button"
      className="history-floating-btn"
      onClick={toggleSidePanel}
      aria-label="History - Open calculation history"
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
  const { isSidePanelOpen } = useHistory();
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
        <div key={activeTool} className="tool-transition-container">
          <Suspense fallback={<ToolLoadingFallback />}>
            {activeTool === 'quick' && <GradeCalculator setToast={setToastMessage} />}
            {activeTool === 'gpa' && <GpaCalculator setToast={setToastMessage} />}
            {activeTool === 'tip' && <TipCalculator setToast={setToastMessage} />}
            {activeTool === 'percentage' && <PercentageCalculator setToast={setToastMessage} />}
            {activeTool === 'loan' && <LoanCalculator setToast={setToastMessage} />}
            {activeTool === 'mortgage' && <MortgageCalculator setToast={setToastMessage} />}
            {activeTool === 'password' && (
              <PasswordGenerator setToast={setToastMessage} />
            )}
          </Suspense>
        </div>

        <div className="active-tool-footnote">
          <CurrentIcon aria-hidden="true" />
          <span>
            You&apos;re using <strong>{currentToolDef.label}</strong>. Switch tools anytime from the navigation above.
          </span>
        </div>

        <Suspense fallback={null}>
          <EducationalGuide />
        </Suspense>
      </main>

      {isSidePanelOpen && (
        <Suspense fallback={null}>
          <HistorySidePanel setToast={setToastMessage} onSelectTool={setActiveTool} />
        </Suspense>
      )}
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

