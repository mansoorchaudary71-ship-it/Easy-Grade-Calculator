import React, { useMemo } from 'react';
import { Sparkles, History, Sun, Moon, Laptop, Search } from 'lucide-react';
import { TOOLS_LIST } from '../data/constants';
import { ToolKey } from '../types';
import { useHistory } from '../context/HistoryContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTool: ToolKey;
  onSelectTool: (tool: ToolKey) => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTool,
  onSelectTool,
  onOpenCommandPalette,
}) => {
  const { history, toggleSidePanel } = useHistory();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const isMac = useMemo(() => {
    return (
      typeof navigator !== 'undefined' &&
      /Mac|iPod|iPhone|iPad/i.test(navigator.userAgent || '')
    );
  }, []);

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button
          className="brand"
          type="button"
          onClick={() => onSelectTool('quick')}
          aria-label="Go to Easy Grade Quick Calculator"
        >
          <span className="brand-mark">
            <Sparkles aria-hidden="true" />
          </span>
          <span className="brand-name">easy grade</span>
        </button>

        <div className="topbar-right">
          {/* Quick Command Palette Trigger */}
          <button
            type="button"
            className="command-nav-trigger"
            onClick={onOpenCommandPalette}
            aria-label={`Open calculator search and command palette (${isMac ? '⌘K' : 'Ctrl+K'})`}
            title={`Switch calculators with Command Palette (${isMac ? '⌘K' : 'Ctrl+K'})`}
          >
            <Search aria-hidden="true" />
            <span className="command-nav-label">Search calculators...</span>
            <kbd className="command-nav-kbd">
              <span>{isMac ? '⌘' : 'Ctrl+'}</span>K
            </kbd>
          </button>

          <div className="topbar-note">
            <span className="pulse-dot" aria-hidden="true" />
            <span>Local &amp; private</span>
          </div>

          {/* Theme switcher */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={cycleTheme}
            aria-label={`Current theme: ${theme}. Click to switch theme.`}
            title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} (Click to cycle)`}
          >
            {theme === 'system' ? (
              <Laptop aria-hidden="true" />
            ) : resolvedTheme === 'dark' ? (
              <Moon aria-hidden="true" />
            ) : (
              <Sun aria-hidden="true" />
            )}
            <span className="theme-toggle-label">{theme}</span>
          </button>

          {/* History drawer trigger */}
          <button
            type="button"
            className="history-nav-trigger"
            onClick={toggleSidePanel}
            aria-label="History - Open calculation history side panel"
          >
            <History aria-hidden="true" />
            <span>History</span>
            {history.length > 0 && (
              <span className="history-badge-count">{history.length}</span>
            )}
          </button>
        </div>
      </div>

      <nav className="tool-nav" aria-label="Calculator tools">
        <div className="tool-nav-inner">
          {TOOLS_LIST.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.key;
            return (
              <button
                key={tool.key}
                type="button"
                className="tool-nav-item"
                data-tool={tool.key}
                data-active={isActive}
                onClick={() => onSelectTool(tool.key)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
