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

      {/* Optimized Educational & SEO Content for Mortgage Calculator */}
      <section className="seo-content w-full max-w-4xl mx-auto mt-12 mb-16" aria-labelledby="mortgage-guide-title">
        <article className="seo-article bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-10 font-sans">
          <h1
            id="mortgage-guide-title"
            className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 tracking-tight"
          >
            Mortgage Loan Calculator &amp; Payment Calculator | Home Mortgage Bank
          </h1>

          <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <img
              src="https://neuroncdn.com/cdn-0001/1a54649a2bb735499e2940dbb9f1c37249451920e79e564b872ca24cfa7faa26?ts=1790324733"
              alt="A hand enters numbers on a calculator next to a small model house."
              className="w-full h-auto object-cover max-h-[460px]"
              loading="lazy"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Are you looking to buy a new home, or simply curious about understanding the dynamics of mortgage payments? A mortgage loan calculator can be an invaluable tool to help you navigate the complexities of home financing. This article will guide you through the process, providing insights into how a mortgage calculator works and how it can empower your financial decisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Understanding the Mortgage Calculator
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            What is a Mortgage Calculator?
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A mortgage calculator is a financial tool designed to help prospective homeowners and current mortgage holders estimate their monthly mortgage payment. This powerful calculator can help you understand the long-term cost of your home loan and identify ways to improve your financial outlook.
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            It takes into account key information to provide an illustrative breakdown of the principal and interest components:
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse my-6 text-left">
              <tbody>
                <tr>
                  <td className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    <strong>Factor</strong>
                  </td>
                  <td className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    <strong>Description</strong>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Loan Amount
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    The total sum of money being borrowed.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Interest Rate
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    The percentage charged on the borrowed amount.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Loan Term
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    The duration over which the loan will be repaid.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            How to Use a Mortgage Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            To use a mortgage calculator, you&apos;ll typically need to input some key low information. The calculator will then quickly determine your monthly mortgage payment, taking into account your location.
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse my-6 text-left">
              <thead>
                <tr>
                  <th className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    Required Information
                  </th>
                  <th className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Total Loan Amount
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    The total amount you intend to borrow for your home.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Interest Rate
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    The low rate offered by your bank.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Loan Term
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    The desired duration of the loan.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Some advanced mortgage calculators may also allow you to include other costs like property taxes, homeowner&apos;s insurance, and PMI (Private Mortgage Insurance) to give you an even more accurate monthly payment estimate.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Benefits of Using a Mortgage Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Utilizing a mortgage calculator offers numerous financial benefits. It provides a clear picture of how different interest rates and loan terms impact your payment, allowing you to explore various mortgage options and make an informed investment decision. It also helps you understand the amortization schedule and how much interest you will pay over the life of the loan.
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse my-6 text-left">
              <thead>
                <tr>
                  <th className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    Feature base
                  </th>
                  <th className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    Benefit
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Estimate potential monthly mortgage payment based on your location and financial profile.
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Helps you budget effectively and determine how much home you can truly afford.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    See impact of interest rates and loan terms
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Allows you to explore various low mortgage options and make an informed investment decision.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Exploring Mortgage Options
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Types of Mortgage Loans
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            When considering a mortgage, it&apos;s crucial to understand the various types of mortgage loans available, as each option has different implications for your monthly payment and overall financial commitment. Common types include <strong className="font-semibold text-gray-900 dark:text-white">fixed-rate mortgages, where the interest rate remains constant for the life of the loan</strong>, offering predictable low monthly payments based on your financial situation. Adjustable-rate mortgages (ARMs), on the other hand, have interest rates that can fluctuate, potentially leading to higher or lower monthly payments over time. It is important to use a mortgage calculator to determine the differences.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Choosing the Right Mortgage Option
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Selecting the right mortgage option requires careful consideration of your personal financial situation, risk tolerance, and long-term goals to improve your overall investment. A mortgage calculator can be an invaluable tool during this low process, allowing you to <strong className="font-semibold text-gray-900 dark:text-white">compare the illustrative monthly payment for different loan amounts, interest rates, and loan terms.</strong> Factors such as your credit score, current income, and future financial stability will all impact which mortgage you qualify for and which option is most suitable for your specific needs, helping you make an informed investment.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Local Mortgage Options and Lenders
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Beyond the general types of mortgages, it’s beneficial to explore local mortgage options and lenders. Local banks and credit unions often offer unique low home loan programs tailored to residents in their location, which might include specific grants or lower interest rates. <strong className="font-semibold text-gray-900 dark:text-white">Using a mortgage calculator to compare offers from different local lenders can help you find the best deal</strong> for your financial situation and ensure you secure a competitive monthly payment. Gathering all the required low information for this calculator will enable you to make a sound decision regarding your home.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Calculating Your Mortgage Payments
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Factors Affecting Mortgage Payments
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Several crucial factors directly influence your mortgage payment, and understanding them is key to managing your financial obligations. The primary components include the <strong className="font-semibold text-gray-900 dark:text-white">principal loan amount, the interest rate offered by the bank, and the loan term. Additionally, other costs like property taxes, homeowner’s insurance, and low private mortgage insurance (PMI) can significantly improve your monthly payment.</strong> A mortgage calculator can help you estimate how each of these factors impacts your overall monthly mortgage payment.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Using a Payment Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Utilizing a payment calculator is an essential step in understanding your potential mortgage costs and how to apply for the best rates. To use this mortgage calculator effectively, you&apos;ll input the specific low loan amount you intend to borrow, the prevailing interest rate, and your desired loan term to apply for the best options. The calculator then provides an illustrative low monthly payment, helping you budget for your home loan. This tool can also be personalized to include additional costs like property taxes and low insurance for a more comprehensive estimate.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Understanding Amortization Schedules
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            An amortization schedule provides a detailed breakdown of each monthly payment, showing <strong className="font-semibold text-gray-900 dark:text-white">how much interest and how much principal you pay over the life of the loan.</strong> This schedule illustrates how your estimated principal balance decreases over time. Understanding your amortization schedule is vital for financial planning, as it demonstrates the long-term cost of your mortgage and helps you see the difference in interest paid between various mortgage options. A mortgage calculator can often generate this schedule for illustrative purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Finding the Right Lender
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Local Lender vs. National Lender
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            When seeking a home loan, you&apos;ll encounter both local and national lenders, each with distinct advantages. Local lenders often provide personalized service and may have unique mortgage options tailored to the community, while national lenders typically offer a broader range of products and potentially more competitive interest rates due to their scale. <strong className="font-semibold text-gray-900 dark:text-white">Using a payment calculator to compare loan offers from both types of lenders can help you determine the best fit for your financial situation and location.</strong> for your financial situation and ensure you secure a favorable monthly mortgage payment.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Questions to Ask Your Lender
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Engaging with potential lenders requires asking pertinent questions to ensure you fully understand your mortgage options. Inquire about the <strong className="font-semibold text-gray-900 dark:text-white">interest rate, loan term, location, and any associated low fees or closing costs.</strong> Ask about the potential for a lower monthly payment if you make a larger down payment, and understand if there&apos;s any low PMI required. Gather all the information required for this calculator to personalize your comparison and determine the best home loan for your needs.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Comparing Loan Offers
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Once you have received multiple low loan offers, it&apos;s critical to meticulously compare them to identify the most advantageous mortgage. Focus on the <strong className="font-semibold text-gray-900 dark:text-white">interest rate, the total loan amount, and the overall monthly payment. Use a mortgage calculator to determine the low long-term cost of each option.</strong>, including how much interest you will pay and the impact of your loan&apos;s base rate. This comprehensive comparison, taking into account all the information gathered, will empower you to make an informed investment decision for your home.
          </p>
        </article>
      </section>
    </>
  );
};
