import React, { useState } from 'react';
import { History } from 'lucide-react';
import { ToolHeading } from './ToolHeading';
import { formatCurrency, parseNumber } from '../utils/formatters';
import { useHistory } from '../context/HistoryContext';

interface TipCalculatorProps {
  setToast?: (msg: string) => void;
}

export const TipCalculator: React.FC<TipCalculatorProps> = ({ setToast }) => {
  const { addHistoryItem } = useHistory();
  const [billTotal, setBillTotal] = useState<string>('84');
  const [tipPercent, setTipPercent] = useState<string>('20');
  const [people, setPeople] = useState<string>('2');

  const billVal = Math.max(0, parseNumber(billTotal));
  const tipVal = Math.max(0, parseNumber(tipPercent));
  const peopleVal = Math.max(1, parseNumber(people, 1));

  const tipAmount = (billVal * tipVal) / 100;
  const totalAmount = billVal + tipAmount;
  const perPersonAmount = totalAmount / peopleVal;

  return (
    <>
      <ToolHeading
        eyebrow="Tip calculator"
        title={
          <>
            Split the bill
            <br />
            <em>without the guesswork.</em>
          </>
        }
        copy="Set the tip you want, divide the total, and know exactly what each person owes."
      />

      <div className="tool-layout">
        <div className="tool-card">
          <div className="tool-form-grid">
            <label className="tool-field">
              <span className="tool-label">Bill total</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={billTotal}
                onChange={(e) => setBillTotal(e.target.value)}
                placeholder="0.00"
              />
            </label>

            <label className="tool-field">
              <span className="tool-label">People</span>
              <input
                className="tool-input"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
              />
            </label>
          </div>

          <div className="tool-label standalone-label">Tip percentage</div>
          <div className="choice-row">
            {['15', '18', '20', '25'].map((percentStr) => (
              <button
                key={percentStr}
                type="button"
                className="choice-button"
                data-active={tipPercent === percentStr}
                onClick={() => setTipPercent(percentStr)}
              >
                {percentStr}%
              </button>
            ))}
            <label className="custom-percent">
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                min="0"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                aria-label="Tip percentage"
              />
              %
            </label>
          </div>
        </div>

        <div className="tool-card tool-result-card">
          <span className="result-kicker">Each person pays</span>
          <div className="tool-big-number">{formatCurrency(perPersonAmount)}</div>

          <div className="metric-grid">
            <div>
              <strong>{formatCurrency(tipAmount)}</strong>
              <span>Tip amount</span>
            </div>
            <div>
              <strong>{formatCurrency(totalAmount)}</strong>
              <span>Total bill</span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="result-action result-action-highlight"
              style={{ width: '100%' }}
              onClick={() => {
                addHistoryItem({
                  type: 'tip',
                  title: 'Tip & Bill Split',
                  value: `${formatCurrency(perPersonAmount)} / person`,
                  subtitle: `Bill: ${formatCurrency(billVal)} · ${tipPercent}% tip · ${peopleVal} people`,
                });
                setToast?.('Tip calculation saved to history.');
              }}
            >
              <History aria-hidden="true" /> Save to History
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
