import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Award, Sparkles, Calendar, Layers } from 'lucide-react';
import { UnifiedHistoryItem } from '../types';
import { useTheme } from '../context/ThemeContext';

export interface CalculationTrendChartProps {
  history: UnifiedHistoryItem[];
  defaultView?: 'grade' | 'gpa' | 'both';
  height?: number;
  compact?: boolean;
  onSelectCalculation?: (item: UnifiedHistoryItem) => void;
}

export interface TrendPoint {
  id: string;
  timestamp: number;
  dateLabel: string;
  fullDate: string;
  type: 'quick' | 'gpa';
  gradePercent?: number;
  gpa?: number;
  normalized: number; // 0 - 100 scale
  title: string;
  value: string;
  subtitle: string;
  letter?: string;
  originalItem: UnifiedHistoryItem;
}

export const CalculationTrendChart: React.FC<CalculationTrendChartProps> = ({
  history,
  defaultView = 'grade',
  height = 240,
  compact = false,
  onSelectCalculation,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [activeMetric, setActiveMetric] = useState<'grade' | 'gpa' | 'both'>(defaultView);

  // Parse history into chronological data points
  const { trendData, gradePoints, gpaPoints } = useMemo(() => {
    const points: TrendPoint[] = [];

    // Filter relevant academic history
    const academicItems = history.filter(
      (item) => item.type === 'quick' || item.type === 'gpa'
    );

    // Sort chronologically (oldest to newest)
    const sorted = [...academicItems].sort((a, b) => a.timestamp - b.timestamp);

    for (const item of sorted) {
      let gradePercent: number | undefined = undefined;
      let gpa: number | undefined = undefined;
      let letter: string | undefined = undefined;

      // Extract letter if present
      const letterMatch = item.value.match(/\(([A-DF][+-]?|[A-F])\)/i);
      if (letterMatch) {
        letter = letterMatch[1].toUpperCase();
      }

      if (item.type === 'quick') {
        if (typeof item.details?.score === 'number') {
          gradePercent = item.details.score;
        } else {
          const match = item.value.match(/(\d+(?:\.\d+)?)%/);
          if (match) {
            gradePercent = parseFloat(match[1]);
          }
        }
      } else if (item.type === 'gpa') {
        if (typeof item.details?.score === 'number') {
          gpa = item.details.score;
        } else {
          const match = item.value.match(/(\d+(?:\.\d+)?)/);
          if (match) {
            gpa = parseFloat(match[1]);
          }
        }
      }

      if (gradePercent === undefined && gpa === undefined) {
        continue;
      }

      // Calculate normalized value (0 - 100)
      const normalized = gradePercent !== undefined ? gradePercent : ((gpa || 0) / 4.0) * 100;

      const dateObj = new Date(item.timestamp);
      const dateLabel = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const fullDate = dateObj.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      points.push({
        id: item.id,
        timestamp: item.timestamp,
        dateLabel,
        fullDate,
        type: item.type as 'quick' | 'gpa',
        gradePercent: gradePercent !== undefined ? Math.round(gradePercent * 10) / 10 : undefined,
        gpa: gpa !== undefined ? Math.round(gpa * 100) / 100 : undefined,
        normalized: Math.round(normalized * 10) / 10,
        title: item.title,
        value: item.value,
        subtitle: item.subtitle,
        letter,
        originalItem: item,
      });
    }

    const gPoints = points.filter((p) => p.gradePercent !== undefined);
    const gpPoints = points.filter((p) => p.gpa !== undefined);

    return {
      trendData: points,
      gradePoints: gPoints,
      gpaPoints: gpPoints,
    };
  }, [history]);

  // Active dataset based on view
  const currentDataset = useMemo(() => {
    if (activeMetric === 'grade') return gradePoints;
    if (activeMetric === 'gpa') return gpaPoints;
    return trendData;
  }, [activeMetric, gradePoints, gpaPoints, trendData]);

  // Statistics
  const stats = useMemo(() => {
    if (!currentDataset.length) return null;

    if (activeMetric === 'gpa') {
      const values = currentDataset.map((d) => d.gpa || 0);
      const latest = values[values.length - 1];
      const highest = Math.max(...values);
      const lowest = Math.min(...values);
      const delta = values.length > 1 ? latest - values[0] : 0;
      return {
        latest: latest.toFixed(2),
        highest: highest.toFixed(2),
        lowest: lowest.toFixed(2),
        delta: Number(delta.toFixed(2)),
        unit: 'GPA',
        count: values.length,
      };
    }

    if (activeMetric === 'grade') {
      const values = currentDataset.map((d) => d.gradePercent || 0);
      const latest = values[values.length - 1];
      const highest = Math.max(...values);
      const lowest = Math.min(...values);
      const delta = values.length > 1 ? latest - values[0] : 0;
      return {
        latest: `${latest.toFixed(1)}%`,
        highest: `${highest.toFixed(1)}%`,
        lowest: `${lowest.toFixed(1)}%`,
        delta: Number(delta.toFixed(1)),
        unit: '%',
        count: values.length,
      };
    }

    // Both / Overall
    const latest = currentDataset[currentDataset.length - 1];
    const values = currentDataset.map((d) => d.normalized);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const delta = values.length > 1 ? values[values.length - 1] - values[0] : 0;

    return {
      latest: latest.gradePercent !== undefined ? `${latest.gradePercent}%` : `${latest.gpa} GPA`,
      highest: `${highest.toFixed(0)}%`,
      lowest: `${lowest.toFixed(0)}%`,
      delta: Number(delta.toFixed(1)),
      unit: 'Index',
      count: values.length,
    };
  }, [currentDataset, activeMetric]);

  // Colors based on theme & metric
  const chartColor = useMemo(() => {
    if (activeMetric === 'grade') {
      return isDark ? '#34d399' : '#059669'; // Emerald
    }
    if (activeMetric === 'gpa') {
      return isDark ? '#818cf8' : '#6366f1'; // Indigo
    }
    return isDark ? '#38bdf8' : '#0284c7'; // Sky / Multi
  }, [activeMetric, isDark]);

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  if (trendData.length === 0) {
    return (
      <div className="trend-chart-empty">
        <div className="trend-empty-icon">
          <TrendingUp aria-hidden="true" />
        </div>
        <div className="trend-empty-content">
          <h4>No trend data recorded yet</h4>
          <p>
            Calculate and save your Quick Grade or GPA calculations to see your visual academic trajectory over time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`trend-chart-card ${compact ? 'is-compact' : ''}`}>
      {/* Header with Title & Metric Tabs */}
      <div className="trend-chart-header">
        <div className="trend-header-main">
          <div className="trend-title-wrap">
            <span className="trend-spark-icon" aria-hidden="true">
              <Sparkles />
            </span>
            <h3 className="trend-title">Calculation Trend Analytics</h3>
          </div>
          <p className="trend-subtitle">
            Visualizing {currentDataset.length} saved {activeMetric === 'gpa' ? 'GPA' : activeMetric === 'grade' ? 'grade' : 'academic'} calculation{currentDataset.length === 1 ? '' : 's'} over time
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="trend-pill-tabs" role="tablist" aria-label="Trend metric view">
          <button
            type="button"
            role="tab"
            aria-selected={activeMetric === 'grade'}
            data-active={activeMetric === 'grade'}
            onClick={() => setActiveMetric('grade')}
            className="trend-pill-btn"
          >
            Grades ({gradePoints.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMetric === 'gpa'}
            data-active={activeMetric === 'gpa'}
            onClick={() => setActiveMetric('gpa')}
            className="trend-pill-btn"
          >
            GPA ({gpaPoints.length})
          </button>
          {gradePoints.length > 0 && gpaPoints.length > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={activeMetric === 'both'}
              data-active={activeMetric === 'both'}
              onClick={() => setActiveMetric('both')}
              className="trend-pill-btn"
            >
              All ({trendData.length})
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="trend-kpi-bar">
          <div className="trend-kpi-item">
            <span className="trend-kpi-label">Latest Result</span>
            <span className="trend-kpi-val highlight">{stats.latest}</span>
          </div>

          <div className="trend-kpi-item">
            <span className="trend-kpi-label">Peak Score</span>
            <span className="trend-kpi-val">{stats.highest}</span>
          </div>

          <div className="trend-kpi-item">
            <span className="trend-kpi-label">Net Direction</span>
            <span
              className={`trend-delta-badge ${
                stats.delta > 0 ? 'is-up' : stats.delta < 0 ? 'is-down' : 'is-flat'
              }`}
            >
              {stats.delta > 0 ? (
                <>
                  <TrendingUp aria-hidden="true" /> +{stats.delta}
                </>
              ) : stats.delta < 0 ? (
                <>
                  <TrendingDown aria-hidden="true" /> {stats.delta}
                </>
              ) : (
                <>
                  <Minus aria-hidden="true" /> Steady
                </>
              )}
            </span>
          </div>

          <div className="trend-kpi-item trend-kpi-count">
            <span className="trend-kpi-label">Data Points</span>
            <span className="trend-kpi-val count">{stats.count}</span>
          </div>
        </div>
      )}

      {/* Main Chart Canvas */}
      <div className="trend-canvas-container" style={{ height }}>
        {currentDataset.length < 2 ? (
          <div className="trend-insufficient-data">
            <Calendar aria-hidden="true" />
            <div>
              <strong>1 calculation recorded ({stats?.latest})</strong>
              <p>Add at least one more calculation to render a full trajectory slope.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentDataset}
              margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length && onSelectCalculation) {
                  const point = e.activePayload[0].payload as TrendPoint;
                  onSelectCalculation(point.originalItem);
                }
              }}
            >
              <defs>
                <linearGradient id={`trendGradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={isDark ? 0.45 : 0.35} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />

              <XAxis
                dataKey="dateLabel"
                stroke={textColor}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                dy={6}
              />

              <YAxis
                domain={
                  activeMetric === 'gpa'
                    ? [0, 4.0]
                    : activeMetric === 'grade'
                    ? [Math.max(0, Math.floor(((stats ? parseFloat(stats.lowest) : 50) - 10) / 10) * 10), 100]
                    : [0, 100]
                }
                stroke={textColor}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (activeMetric === 'gpa' ? val.toFixed(1) : `${val}%`)}
              />

              {/* Reference Benchmarks */}
              {activeMetric === 'grade' && (
                <ReferenceLine
                  y={90}
                  stroke={isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(5, 150, 105, 0.4)'}
                  strokeDasharray="3 3"
                  label={{
                    value: 'A (90%)',
                    fill: textColor,
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}

              {activeMetric === 'gpa' && (
                <ReferenceLine
                  y={3.5}
                  stroke={isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(99, 102, 241, 0.4)'}
                  strokeDasharray="3 3"
                  label={{
                    value: 'Honors (3.5)',
                    fill: textColor,
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
              )}

              <Tooltip
                content={<CustomTrendTooltip isDark={isDark} activeMetric={activeMetric} />}
              />

              <Area
                type="monotone"
                dataKey={
                  activeMetric === 'grade'
                    ? 'gradePercent'
                    : activeMetric === 'gpa'
                    ? 'gpa'
                    : 'normalized'
                }
                stroke={chartColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#trendGradient-${activeMetric})`}
                dot={{
                  r: 4,
                  fill: chartColor,
                  stroke: isDark ? '#0f172a' : '#ffffff',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: chartColor,
                  stroke: isDark ? '#ffffff' : '#0f172a',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  isDark: boolean;
  activeMetric: 'grade' | 'gpa' | 'both';
}

const CustomTrendTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  isDark,
  activeMetric,
}) => {
  if (!active || !payload || !payload.length) return null;

  const data: TrendPoint = payload[0].payload;
  const isGpa = data.type === 'gpa';

  return (
    <div className={`trend-tooltip-card ${isDark ? 'is-dark' : 'is-light'}`}>
      <div className="trend-tooltip-top">
        <span className="trend-tooltip-badge" data-tool={data.type}>
          {isGpa ? 'GPA' : 'Grade'}
        </span>
        <span className="trend-tooltip-date">{data.fullDate}</span>
      </div>

      <div className="trend-tooltip-body">
        <div className="trend-tooltip-score">
          {data.gradePercent !== undefined ? (
            <>
              <strong>{data.gradePercent}%</strong>
              {data.letter && <span className="trend-tooltip-letter">{data.letter}</span>}
            </>
          ) : (
            <>
              <strong>{data.gpa?.toFixed(2)}</strong>
              <span className="trend-tooltip-denom">/ 4.0</span>
            </>
          )}
        </div>
        <p className="trend-tooltip-sub">{data.subtitle}</p>
      </div>
    </div>
  );
};
