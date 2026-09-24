import React, { useState } from 'react';
import { FileDown, History } from 'lucide-react';
import { ToolHeading } from './ToolHeading';
import { formatCurrency, parseNumber } from '../utils/formatters';
import { useHistory } from '../context/HistoryContext';

interface PaymentResultCardProps {
  principal: number;
  rate: number;
  years: number;
  extra?: number;
  title?: string;
  homePrice?: number;
  downPayment?: number;
  setToast?: (msg: string) => void;
}

export const PaymentResultCard: React.FC<PaymentResultCardProps> = ({
  principal,
  rate,
  years,
  extra = 0,
  title = 'Loan',
  homePrice,
  downPayment,
  setToast,
}) => {
  const { addHistoryItem } = useHistory();
  const months = Math.max(1, years * 12);
  const monthlyRate = rate / 100 / 12;

  const monthlyPrincipalAndInterest =
    monthlyRate === 0
      ? principal / months
      : (principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  const totalPaid = monthlyPrincipalAndInterest * months;
  const totalInterest = Math.max(0, totalPaid - principal);
  const totalMonthly = monthlyPrincipalAndInterest + extra;

  return (
    <div className="tool-card tool-result-card">
      <span className="result-kicker">Estimated monthly payment</span>
      <div className="tool-big-number">{formatCurrency(totalMonthly)}</div>
      <p className="tool-result-copy">
        Based on a fixed rate over {years} {years === 1 ? 'year' : 'years'}.
      </p>

      <div className="metric-grid">
        <div>
          <strong>{formatCurrency(totalInterest)}</strong>
          <span>Total interest</span>
        </div>
        <div>
          <strong>{formatCurrency(totalPaid)}</strong>
          <span>Total paid</span>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gap: '8px' }}>
        <button
          type="button"
          className="result-action"
          style={{ width: '100%' }}
          onClick={() => {
            const isMortgage = title.toLowerCase().includes('mortgage');
            addHistoryItem({
              type: isMortgage ? 'mortgage' : 'loan',
              title: isMortgage ? 'Mortgage Payment' : 'Loan Payment',
              value: `${formatCurrency(totalMonthly)} / mo`,
              subtitle: isMortgage
                ? `Loan: ${formatCurrency(principal)} · ${rate}% · ${years} yrs (Tax/Ins: ${formatCurrency(extra)}/mo)`
                : `Principal: ${formatCurrency(principal)} · ${rate}% · ${years} yrs`,
            });
            setToast?.(`${title} calculation saved to history.`);
          }}
        >
          <History aria-hidden="true" /> Save to History
        </button>

        <button
          type="button"
          className="result-action result-action-highlight"
          style={{ width: '100%' }}
          onClick={async () => {
            try {
              const { exportLoanReportPdf } = await import('../utils/pdfExport');
              exportLoanReportPdf({
                title,
                principal,
                rate,
                years,
                monthlyPayment: totalMonthly,
                totalInterest,
                totalPaid,
                extraMonthly: extra,
                homePrice,
                downPayment,
              });
              const isMortgage = title.toLowerCase().includes('mortgage');
              addHistoryItem({
                type: isMortgage ? 'mortgage' : 'loan',
                title: isMortgage ? 'Mortgage PDF Report' : 'Loan PDF Report',
                value: `${formatCurrency(totalMonthly)} / mo`,
                subtitle: `Exported PDF · ${formatCurrency(principal)} at ${rate}% for ${years} yrs`,
              });
              setToast?.(`${title} PDF report generated and downloaded.`);
            } catch {
              setToast?.('Could not generate PDF report.');
            }
          }}
        >
          <FileDown aria-hidden="true" /> Export PDF Report
        </button>
      </div>
    </div>
  );
};

interface LoanCalculatorProps {
  setToast?: (msg: string) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({ setToast }) => {
  const [loanAmount, setLoanAmount] = useState<string>('25000');
  const [interestRate, setInterestRate] = useState<string>('7.5');
  const [termYears, setTermYears] = useState<string>('5');

  const principal = Math.max(0, parseNumber(loanAmount));
  const rate = Math.max(0, parseNumber(interestRate));
  const years = Math.max(1, parseNumber(termYears, 1));

  return (
    <>
      <ToolHeading
        eyebrow="Loan calculator"
        title={
          <>
            See the cost
            <br />
            <em>before you commit.</em>
          </>
        }
        copy="Estimate your monthly payment and understand how interest changes the full cost of a loan."
      />

      <div className="tool-layout">
        <div className="tool-card">
          <div className="tool-form-grid">
            <label className="tool-field">
              <span className="tool-label">Loan amount</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                min="0"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </label>

            <label className="tool-field">
              <span className="tool-label">Annual interest rate (%)</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </label>

            <label className="tool-field">
              <span className="tool-label">Loan term (years)</span>
              <input
                className="tool-input"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={termYears}
                onChange={(e) => setTermYears(e.target.value)}
              />
            </label>
          </div>

          <p className="tool-note">
            This estimate uses a fixed rate and monthly payments. Fees and taxes are not included.
          </p>
        </div>

        <PaymentResultCard
          principal={principal}
          rate={rate}
          years={years}
          title="Loan Payment"
          setToast={setToast}
        />
      </div>
    </>
  );
};
