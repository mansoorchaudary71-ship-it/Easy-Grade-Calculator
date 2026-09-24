import React, { useState } from 'react';
import {
  History,
  X,
  Trash2,
  Copy,
  Check,
  GraduationCap,
  Lightbulb,
  Percent,
  Banknote,
  House,
  KeyRound,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import { ToolKey, UnifiedHistoryItem } from '../types';

const CalculationTrendChart = React.lazy(() =>
  import('./CalculationTrendChart').then((m) => ({ default: m.CalculationTrendChart }))
);

interface HistorySidePanelProps {
  setToast: (msg: string) => void;
  onSelectTool?: (tool: ToolKey) => void;
}

const TOOL_ICONS: Record<ToolKey, typeof GraduationCap> = {
  quick: GraduationCap,
  gpa: GraduationCap,
  tip: Lightbulb,
  percentage: Percent,
  loan: Banknote,
  mortgage: House,
  password: KeyRound,
};

const TOOL_LABELS: Record<ToolKey, string> = {
  quick: 'Quick Grade',
  gpa: 'GPA',
  tip: 'Tip',
  percentage: 'Percentage',
  loan: 'Loan',
  mortgage: 'Mortgage',
  password: 'Password',
};

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
}

export const HistorySidePanel: React.FC<HistorySidePanelProps> = ({
  setToast,
  onSelectTool,
}) => {
  const {
    history,
    isSidePanelOpen,
    closeSidePanel,
    removeHistoryItem,
    clearHistory,
  } = useHistory();

  const [activeFilter, setActiveFilter] = useState<'all' | ToolKey>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTrendChart, setShowTrendChart] = useState<boolean>(true);

  // Handle ESC key and scroll lock
  React.useEffect(() => {
    if (!isSidePanelOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSidePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidePanelOpen, closeSidePanel]);

  if (!isSidePanelOpen) return null;

  const hasAcademicHistory = history.some(
    (item) => item.type === 'quick' || item.type === 'gpa'
  );

  const filteredHistory = activeFilter === 'all'
    ? history
    : history.filter((item) => item.type === activeFilter);

  const handleCopyItem = async (item: UnifiedHistoryItem) => {
    try {
      const text = `${item.title}: ${item.value} (${item.subtitle})`;
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setToast('Copied to clipboard.');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setToast('Copy is unavailable in this browser.');
    }
  };

  const handleClear = () => {
    if (activeFilter === 'all') {
      clearHistory();
      setToast('All calculation history cleared.');
    } else {
      clearHistory(activeFilter);
      setToast(`${TOOL_LABELS[activeFilter]} history cleared.`);
    }
  };

  return (
    <div className="history-drawer-wrapper" role="dialog" aria-modal="true" aria-label="Calculation History">
      {/* Backdrop */}
      <div
        className="history-backdrop"
        onClick={closeSidePanel}
        aria-hidden="true"
      />

      {/* Side Drawer Panel */}
      <aside className="history-drawer">
        {/* Header */}
        <div className="history-drawer-header">
          <div className="history-header-title">
            <span className="history-header-icon">
              <History aria-hidden="true" />
            </span>
            <div>
              <h2>Recent Calculations</h2>
              <p>
                {history.length === 0
                  ? 'No saved calculations yet'
                  : `${history.length} calculation${history.length === 1 ? '' : 's'} saved locally`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="history-close-btn"
            onClick={closeSidePanel}
            aria-label="Close history panel"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="history-filter-bar">
          <button
            type="button"
            className="history-filter-pill"
            data-active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            All ({history.length})
          </button>
          {(['quick', 'gpa', 'tip', 'percentage', 'loan', 'mortgage', 'password'] as ToolKey[]).map(
            (key) => {
              const count = history.filter((h) => h.type === key).length;
              if (count === 0 && activeFilter !== key) return null;
              return (
                <button
                  key={key}
                  type="button"
                  className="history-filter-pill"
                  data-active={activeFilter === key}
                  onClick={() => setActiveFilter(key)}
                >
                  {TOOL_LABELS[key]} ({count})
                </button>
              );
            }
          )}
        </div>

        {/* List Content */}
        <div className="history-drawer-content">
          {/* Visual Trend Chart Section */}
          {hasAcademicHistory && (activeFilter === 'all' || activeFilter === 'quick' || activeFilter === 'gpa') && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  padding: '0 4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp
                    style={{ width: '14px', height: '14px', color: 'hsl(var(--tool-primary))' }}
                    aria-hidden="true"
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontFamily: 'var(--app-font-mono)',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    Trajectory Trend
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrendChart(!showTrendChart)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    color: 'hsl(var(--muted-foreground))',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                  aria-expanded={showTrendChart}
                >
                  {showTrendChart ? (
                    <>
                      Hide Chart <ChevronUp style={{ width: '13px', height: '13px' }} />
                    </>
                  ) : (
                    <>
                      Show Chart <ChevronDown style={{ width: '13px', height: '13px' }} />
                    </>
                  )}
                </button>
              </div>

              {showTrendChart && (
                <CalculationTrendChart
                  history={history}
                  defaultView={activeFilter === 'gpa' ? 'gpa' : 'grade'}
                  height={190}
                  compact
                  onSelectCalculation={(item) => {
                    if (onSelectTool) {
                      onSelectTool(item.type);
                      closeSidePanel();
                    }
                  }}
                />
              )}
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">
                <History aria-hidden="true" />
              </div>
              <h3>No {activeFilter !== 'all' ? TOOL_LABELS[activeFilter] : ''} Calculations</h3>
              <p>
                As you use any of the calculators on this site, your results are automatically saved here for quick reference.
              </p>
            </div>
          ) : (
            <div className="history-cards-list">
              {filteredHistory.map((item) => {
                const Icon = TOOL_ICONS[item.type] || History;
                const toolName = TOOL_LABELS[item.type] || item.title;
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="history-card"
                    data-tool={item.type}
                  >
                    <div className="history-card-top">
                      <button
                        type="button"
                        className="history-card-badge"
                        onClick={() => {
                          if (onSelectTool) {
                            onSelectTool(item.type);
                            closeSidePanel();
                          }
                        }}
                        title={`Switch to ${toolName}`}
                      >
                        <Icon aria-hidden="true" />
                        <span>{toolName}</span>
                      </button>

                      <span className="history-card-time">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <div className="history-card-body">
                      <div className="history-card-val">{item.value}</div>
                      <div className="history-card-sub">{item.subtitle}</div>
                    </div>

                    <div className="history-card-actions">
                      <button
                        type="button"
                        className="history-card-btn"
                        onClick={() => handleCopyItem(item)}
                        title="Copy to clipboard"
                        aria-label="Copy result"
                      >
                        {isCopied ? (
                          <>
                            <Check aria-hidden="true" style={{ color: '#10b981' }} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="history-card-btn history-card-btn-delete"
                        onClick={() => removeHistoryItem(item.id)}
                        title="Delete from history"
                        aria-label="Delete calculation"
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="history-drawer-footer">
          {history.length > 0 && (
            <button
              type="button"
              className="history-clear-btn"
              onClick={handleClear}
            >
              <Trash2 aria-hidden="true" />
              <span>
                {activeFilter === 'all'
                  ? 'Clear All History'
                  : `Clear ${TOOL_LABELS[activeFilter]} History`}
              </span>
            </button>
          )}

          <div className="history-footer-note">
            <span>Encrypted locally · Never sent to a server</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
