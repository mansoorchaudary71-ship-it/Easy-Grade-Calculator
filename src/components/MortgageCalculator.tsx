import React, { useState } from 'react';
import { ToolHeading } from './ToolHeading';
import { PaymentResultCard } from './LoanCalculator';
import { formatCurrency, parseNumber } from '../utils/formatters';

interface MortgageCalculatorProps {
  setToast?: (msg: string) => void;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ setToast }) => {
  const [homePrice, setHomePrice] = useState<string>('350000');
  const [downPayment, setDownPayment] = useState<string>('70000');
  const [interestRate, setInterestRate] = useState<string>('6.5');
  const [termYears, setTermYears] = useState<string>('30');
  const [propertyTax, setPropertyTax] = useState<string>('4200');
  const [homeInsurance, setHomeInsurance] = useState<string>('1800');

  const priceVal = Math.max(0, parseNumber(homePrice));
  const downVal = Math.max(0, parseNumber(downPayment));
  const loanPrincipal = Math.max(0, priceVal - downVal);
  const rateVal = Math.max(0, parseNumber(interestRate));
  const yearsVal = Math.max(1, parseNumber(termYears, 30));

  const annualTaxVal = Math.max(0, parseNumber(propertyTax));
  const annualInsuranceVal = Math.max(0, parseNumber(homeInsurance));
  const monthlyTaxesAndInsurance = (annualTaxVal + annualInsuranceVal) / 12;

  return (
    <>
      <ToolHeading
        eyebrow="Mortgage calculator"
        title={
          <>
            Make the monthly
            <br />
            <em>number feel real.</em>
          </>
        }
        copy="Estimate principal, interest, taxes, and insurance together for a clearer picture of a home payment."
      />

      <div className="tool-layout">
        <div className="tool-card">
          <div className="tool-form-grid">
            <label className="tool-field">
              <span className="tool-label">Home price</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                value={homePrice}
                onChange={(e) => setHomePrice(e.target.value)}
              />
            </label>

            <label className="tool-field">
              <span className="tool-label">Down payment</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
            </label>

            <label className="tool-field">
              <span className="tool-label">Interest rate (%)</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </label>

            <label className="tool-field">
              <span className="tool-label">Term (years)</span>
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

            <label className="tool-field">
              <span className="tool-label">Property tax / year</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                value={propertyTax}
                onChange={(e) => setPropertyTax(e.target.value)}
              />
            </label>

            <label className="tool-field">
              <span className="tool-label">Home insurance / year</span>
              <input
                className="tool-input"
                type="number"
                inputMode="decimal"
                value={homeInsurance}
                onChange={(e) => setHomeInsurance(e.target.value)}
              />
            </label>
          </div>

          <p className="tool-note">
            Taxes and insurance are optional estimates added to the monthly principal and interest payment.
          </p>
        </div>

        <div>
          <PaymentResultCard
            principal={loanPrincipal}
            rate={rateVal}
            years={yearsVal}
            extra={monthlyTaxesAndInsurance}
            title="Mortgage Payment"
            homePrice={priceVal}
            downPayment={downVal}
            setToast={setToast}
          />

          <div className="mini-summary">
            <span>
              Loan amount <strong>{formatCurrency(loanPrincipal)}</strong>
            </span>
            <span>
              Taxes + insurance{' '}
              <strong>{formatCurrency(monthlyTaxesAndInsurance)} / mo</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
