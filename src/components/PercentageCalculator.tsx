import React, { useState } from 'react';
import { History } from 'lucide-react';
import { ToolHeading } from './ToolHeading';
import { parseNumber } from '../utils/formatters';
import { useHistory } from '../context/HistoryContext';

type PercentageMode = 'of' | 'is' | 'change';

interface PercentageCalculatorProps {
  setToast?: (msg: string) => void;
}

export const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({ setToast }) => {
  const { addHistoryItem } = useHistory();
  const [mode, setMode] = useState<PercentageMode>('of');
  const [val1, setVal1] = useState<string>('20');
  const [val2, setVal2] = useState<string>('150');

  const num1 = parseNumber(val1);
  const num2 = parseNumber(val2);

  let formattedResult = '0.00';
  let explanation = '';

  if (mode === 'of') {
    formattedResult = `${((num1 / 100) * num2).toFixed(2)}`;
    explanation = `${num1}% of ${num2}`;
  } else if (mode === 'is') {
    formattedResult = `${num2 !== 0 ? ((num1 / num2) * 100).toFixed(2) : '0.00'}%`;
    explanation = `${num1} compared with ${num2}`;
  } else {
    formattedResult = `${num2 !== 0 ? (((num1 - num2) / num2) * 100).toFixed(2) : '0.00'}%`;
    explanation = 'change from original to new value';
  }

  const fieldLabels: [string, string] =
    mode === 'of'
      ? ['What percent?', 'Of what number?']
      : mode === 'is'
      ? ['This number', 'Is what percent of?']
      : ['New value', 'Original value'];

  return (
    <>
      <ToolHeading
        eyebrow="Percentage calculator"
        title={
          <>
            Make percentages
            <br />
            <em>feel straightforward.</em>
          </>
        }
        copy="Find a percentage of a number, reverse a percentage, or compare the change between two values."
      />

      <div className="tool-card percentage-card">
        <div className="choice-row tool-tabs">
          {[
            ['of', 'Percent of'],
            ['is', 'What percent?'],
            ['change', 'Percent change'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="choice-button"
              data-active={mode === key}
              onClick={() => setMode(key as PercentageMode)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="tool-form-grid">
          <label className="tool-field">
            <span className="tool-label">{fieldLabels[0]}</span>
            <input
              className="tool-input"
              type="number"
              inputMode="decimal"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
            />
          </label>

          <label className="tool-field">
            <span className="tool-label">{fieldLabels[1]}</span>
            <input
              className="tool-input"
              type="number"
              inputMode="decimal"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
            />
          </label>
        </div>

        <div className="answer-strip">
          <span>Your answer</span>
          <strong>{formattedResult}</strong>
          <small>{explanation}</small>

          <button
            type="button"
            className="result-action result-action-highlight"
            style={{ marginTop: '14px', width: 'auto', alignSelf: 'center', padding: '7px 16px' }}
            onClick={() => {
              addHistoryItem({
                type: 'percentage',
                title: 'Percentage Calculation',
                value: formattedResult,
                subtitle: explanation,
              });
              setToast?.('Percentage calculation saved to history.');
            }}
          >
            <History aria-hidden="true" /> Save to History
          </button>
        </div>
      </div>
    </>
  );
};
