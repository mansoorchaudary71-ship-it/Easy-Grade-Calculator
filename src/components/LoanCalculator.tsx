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

      {/* Optimized Educational & SEO Content for Loan Calculator */}
      <section className="seo-content w-full max-w-4xl mx-auto mt-12 mb-16" aria-labelledby="loan-guide-title">
        <article className="seo-article bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-10 font-sans">
          <h1
            id="loan-guide-title"
            className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 tracking-tight"
          >
            Loan Payment Calculator - Mortgage &amp; Auto Loan Payment Tool
          </h1>

          <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <img
              src="https://neuroncdn.com/cdn-0001/9a9d228c67f101b1c8846898fd376fb25128f0856a8e96b188730de2fa60d86d?ts=1790323946"
              alt="A calculator on a desk next to papers labeled "
              className="w-full h-auto object-cover max-h-[460px]"
              loading="lazy"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A loan payment calculator is a valuable financial tool that empowers individuals to make informed decisions regarding their borrowing, including understanding their car loan means. Whether you&apos;re considering a mortgage, an auto loan, or a personal loan, <strong className="font-semibold text-gray-900 dark:text-white">Understanding your potential monthly payments is crucial for effective financial planning, especially when considering your ability to repay unexpected expenses.</strong>.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Understanding the Loan Payment Calculator
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            What is a Loan Payment Calculator?
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A loan payment calculator is an online tool designed to help borrowers estimate their monthly loan payments, including any additional fees required to pay, ensuring that their debt is paid efficiently. By inputting key details about a loan, such as the loan amount, interest rate, and loan term, the calculator can quickly provide an estimated monthly payment and the total interest payments, helping you prepare for any unexpected expenses. This allows prospective borrowers to understand the financial commitment associated with different loan types before they even approach a lender, ensuring they have the ability to repay. It&apos;s an essential first step in exploring various repayment plans.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            How Does a Payment Calculator Work?
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The payment calculator functions by utilizing a specific mathematical formula to determine your estimated monthly payment, including the annual percentage rate, in addition to the principal, which also applies to understanding a car loan means. You typically input the total loan amount you wish to borrow, the annual interest rate (APR) offered by lenders, and the loan term in years or months, which helps in estimating your monthly car loan. For instance, if you&apos;re looking at a mortgage, you&apos;d input the mortgage loan amount and the terms of your loan. The calculator then processes these figures to display your monthly payment, including an estimate of the principal and interest components, and often the total interest paid over the life of the loan.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Benefits of Using a Loan Payment Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Using a loan payment calculator offers numerous benefits. <strong className="font-semibold text-gray-900 dark:text-white">It allows you to estimate your monthly payment and understand the total interest you might pay, helping you compare different loan options and make informed decisions about the terms of your loan.</strong>. Whether you&apos;re considering a car loan, a student loan, or need to refinance an existing loan, this calculator helps you visualize the financial commitment and prepare for unexpected expenses. You can also experiment with extra payments toward the principal to see how they might reduce the loan term and total interest paid, thus optimizing your repayment plan with a lower interest rate, particularly in the context of a car loan means.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Types of Loans Covered
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Mortgage Loans
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A mortgage loan is a significant financial commitment, and understanding its repayment structure, including the total interest paid back, is crucial, just as it is for a car loan means. Our loan calculator is an invaluable tool for prospective homeowners, allowing them to accurately estimate their monthly mortgage payments and understand how the sales price affects their budget, similar to how a car loan means works. By inputting the total loan amount, the interest rate, and the loan term, you can use our free calculator to determine your estimated monthly payments. <strong className="font-semibold text-gray-900 dark:text-white">borrowers can gain a clear picture of their financial obligations, including the principal and interest components, and the total interest paid over the life of the mortgage loan</strong>. This enables effective budgeting and comparison of different loan options from various lenders, including term loans, their loan interest rates, and potential closing costs.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Auto Loans
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            When considering an auto loan, our calculator provides a convenient way to estimate your monthly payment, taking into account the trade-in value of your current vehicle, making the car buying process much clearer. Whether you&apos;re purchasing a new or used vehicle, you can input the car price as the loan amount, along with the interest rate and desired loan term. <strong className="font-semibold text-gray-900 dark:text-white">The auto loan calculator will then provide an estimated monthly payment, helping you determine affordability and compare repayment plans for different car loans, including the price of the car and the car loan means.</strong>. This tool is essential for managing your budget and understanding the total amount paid, including aspects related to a car loan means.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Student Loans
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Navigating student loans can be complex, but our loan payment calculator simplifies the process of understanding your future repayment and interest payments. Borrowers can use this calculator to estimate their monthly payment by entering the student loan amount, the applicable interest rate, and the loan term, as well as understanding the car loan means. <strong className="font-semibold text-gray-900 dark:text-white">This provides a clear forecast of the financial commitment, allowing you to plan your budget and explore various repayment options, including free loan offers.</strong>. Understanding the total interest paid over the loan’s duration, including a car loan means, is also made easier, aiding in responsible financial planning and ensuring that your debt is paid.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            How to Use This Calculator
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Step-by-Step Guide to Estimate Your Monthly Payments
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Using our loan payment calculator to estimate your monthly payments is straightforward and designed for ease of use. This powerful tool allows you to quickly assess the financial implications of different loan types, from a mortgage to a personal loan, and even term loans for a used car. By following a few simple steps with our calculator to find the best loan terms, <strong className="font-semibold text-gray-900 dark:text-white">You can gain valuable insights into your potential repayment plan for your car loan, helping you make informed decisions about your borrowing needs and ensuring that your debt is paid.</strong>. The calculator provides a clear picture of what your monthly commitment will entail, allowing you to plan for your car loan and any unexpected expenses.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Entering Loan Amount and Term
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            To effectively use this calculator to find the total loan amount you need to borrow, your first step is to accurately input the amount, especially if it involves a car loan means. This could be the purchase price of a home for a mortgage, the car price for an auto loan, or the principal balance for a student loan. Following this, you will need to specify the loan term, which is the duration over which you plan to repay the loan, typically expressed in years or months. The calculator uses these figures to begin formulating your estimated monthly payment and the overall amortization schedule.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Understanding Interest Rates
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The interest rate, often expressed as an APR, is a critical factor in determining your monthly payment and the total interest paid over the life of the loan. When using the payment calculator, you will need to input the annual interest rate offered by the lender, as well as any additional fees required to pay, particularly for a car loan means. <strong className="font-semibold text-gray-900 dark:text-white">Even a small difference in the interest rate can significantly impact your estimated monthly payment and the total amount paid</strong>. Experimenting with different interest rates on the calculator can help you understand how loan interest affects your overall loan cost and repayment plan.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Estimating Your Monthly Loan Payments
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Calculating Monthly Mortgage Payments
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            When you use this calculator to estimate your monthly mortgage payments, you&apos;re gaining invaluable insight into one of your most significant financial commitments, including how prepayment can affect your loan. The loan calculator factors in the total loan amount, the interest rate, and the loan term to provide a clear picture of your estimated monthly payment, so you can better understand how the longer the term affects your payments. <strong className="font-semibold text-gray-900 dark:text-white">Understanding the principal and interest breakdown within that payment is crucial for long-term financial planning</strong>This allows you to gauge affordability and compare various mortgage options from different lenders, ensuring you choose the best terms of your loan. This careful calculation ensures you can budget effectively for your future home, taking into account the total amount you will need to borrow the money.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Estimating Monthly Car Loan Payments
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            For those considering a new vehicle, our loan calculator is an indispensable tool for estimating monthly car loan payments, which helps in understanding the car loan means. By inputting the car price as the total loan amount, along with the interest rate and desired loan term, you can use our free auto loan calculator to estimate your payments and ensure your debt is paid on time. <strong className="font-semibold text-gray-900 dark:text-white">You can quickly determine your estimated monthly payment using our financial calculators, including the auto loan calculator to estimate your payments for a vehicle.</strong>. This allows you to evaluate different auto loan options and ensure the repayment plan aligns with your budget, helping you make an informed decision without committing to an unaffordable payment amount. The calculator takes the guesswork out of purchasing your next vehicle, allowing you to use our free auto loan calculator to estimate your payments while planning for unexpected expenses.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Factors Affecting Loan Payments
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Several critical factors significantly impact your loan payments. The total loan amount, naturally, plays a primary role, as a larger loan will result in a higher monthly payment, which is crucial for ensuring your debt is paid. The interest rate, often expressed as an APR, is another crucial element; even a slight difference can alter your monthly payment and the total interest paid over the loan term. Finally, the loan term itself directly influences the payment amount, particularly in the context of a car loan means; <strong className="font-semibold text-gray-900 dark:text-white">a longer repayment period generally means lower monthly payments but potentially more total interest paid over the life of the loan</strong>. Understanding these variables is key to effectively using this calculator, particularly the interest rate is the percentage that affects your total payment.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Loan Repayment Strategies
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Amortizing Your Loan Payments
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Amortization is the process of paying off a loan with regular payments, where each payment covers both principal and interest, gradually reducing the loan balance over the loan term while considering the annual percentage rate. Our loan calculator provides an amortization schedule that illustrates how your principal and interest components change over time, helping you see how the loan is fully paid off, whether semiannually or annually. In the initial stages, a larger portion of your monthly payment goes towards interest, but as you continue to make payments, <strong className="font-semibold text-gray-900 dark:text-white">More of your payment is allocated to reducing the loan balance, leading to a faster reduction in the total loan amount and total interest paid back, ensuring that your debt is paid efficiently.</strong>. This allows you to visualize your repayment plan using financial calculators.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Choosing the Right Loan Term
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Selecting the appropriate loan term is a critical decision that impacts both your monthly payment and the total interest paid over the life of the loan, especially if you choose a fixed-rate option, affecting your ability to repay. <strong className="font-semibold text-gray-900 dark:text-white">A shorter loan term typically results in higher estimated monthly payments but means less interest paid overall, affecting your ability to repay, especially for a car loan means.</strong>, as you&apos;re paying off the loan amount more quickly. Conversely, a longer loan term offers lower monthly payments, making the loan more affordable on a month-to-month basis, but usually results in more total interest paid over the entire repayment period. Use this calculator to experiment with different repayment terms to find the right balance for your financial situation.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Managing Your Loan Repayment Effectively
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Effective loan repayment involves more than just making your monthly payment; it requires strategic planning to minimize the total interest paid and achieve financial freedom sooner with the right financial calculators. <strong className="font-semibold text-gray-900 dark:text-white">Utilizing the loan calculator to estimate your monthly payment for various scenarios, such as making extra payments, can significantly reduce your loan term and overall interest, while also considering any additional fees.</strong>. Regularly reviewing your repayment plan, considering options like refinancing if interest rates drop, and ensuring you have a good credit score can also contribute to more favorable repayment terms and less interest. This proactive approach helps borrowers manage their loan repayment effectively, ensuring they have the ability to repay their debts, including those related to a car loan means.
          </p>
        </article>
      </section>
    </>
  );
};
