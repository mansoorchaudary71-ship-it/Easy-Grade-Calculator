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

      {/* Optimized Educational & SEO Content for Tip Calculator */}
      <section className="seo-content w-full max-w-4xl mx-auto mt-12 mb-16" aria-labelledby="tip-guide-title">
        <article className="seo-article bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-10 font-sans">
          <h1
            id="tip-guide-title"
            className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 tracking-tight"
          >
            Tip Calculator — Quickly Calculate a Tip and Split the Bill
          </h1>

          <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <img
              src="https://neuroncdn.com/cdn-0001/9dd50f0fb92a0675a352d3ca669168a96bc117dc8e8907dbd6a717126b0108d0?ts=1790321469"
              alt="A smartphone screen shows a tip calculator app with bill total, tip percent, and split fields."
              className="w-full h-auto object-cover max-h-[460px]"
              loading="lazy"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Welcome to our comprehensive guide on tip calculators, an indispensable tool for dining out at restaurants and cafes and for various services. This article will illuminate what a tip calculator is, how to effectively use it, and the numerous advantages it offers in simplifying your financial transactions, including budgeting for great service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Understanding the Tip Calculator
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            What is a Tip Calculator?
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A tip calculator is a convenient digital tool designed to help you multiply the bill by the chosen tip percentage, like half of 10 percent, for accurate gratuity calculations, especially in restaurants and cafes. <strong className="font-semibold text-gray-900 dark:text-white">Quickly calculate a tip amount based on your bill, ensuring you know exactly how much to leave for great service.</strong> It acts as a specialized calculator that automates the process of determining how much to tip for services, especially when dining out, and allows you to calculate total including the sales tax automatically added. Instead of manually calculating the gratuity, a tip calculator streamlines the process, ensuring accuracy and saving you time when tipping for goods and services, especially in full-service restaurants. This handy gratuity calculator takes the guesswork out of leaving a tip, making it an essential companion for anyone who frequently dines or uses services where a tip is expected.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            How to Use a Tip Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            To use a tip calculator, you typically perform a few simple steps to ensure you know exactly how much to tip for excellent service. The calculator then automatically calculates the tip amount and displays the total, ensuring you account for the chosen tip percentage. Some advanced models even allow you to add tax or consider a pre-tax amount, and often provide an option to split the bill among multiple people.
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse my-6 text-left">
              <thead>
                <tr>
                  <th className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    Action
                  </th>
                  <th className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Input Bill Amount
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Also known as the restaurant bill or the service charge, it can often be adjusted for a bigger tip, especially if restaurants have an obligatory minimum.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Select Tip Percentage
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Represents how much to tip for the service received, helping you find the total with ease, especially if you decide to leave a 20 percent gratuity.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Advantages of Using a Tip Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Using a free tip calculator offers several advantages over calculating the tip without a calculator, as it can also calculate various percentages quickly. It can help in budgeting, as you can instantly see the total bill with the gratuity included, allowing you to plan for great service. It also simplifies splitting the bill among friends, ensuring everyone pays their fair share of the total amount, which can be calculated as a percentage of the bill by 1.20.
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Here are some other key advantages: it can also calculate different tip percentages based on your preferences, which may vary in different regions.
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse my-6 text-left">
              <tbody>
                <tr>
                  <td className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    <strong>Advantage</strong>
                  </td>
                  <td className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    <strong>Description of the calculator to quickly determine the appropriate tip for service workers, ensuring fair compensation for certain service.</strong>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Accuracy is essential when using a tip calculator to ensure the correct tip percent is applied, especially if you want to leave a bigger tip for goods and services rendered.
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Eliminates human error in calculating the tip amount, especially with unusual tip percentages or large bills, ensuring you find the total accurately, even if it may vary in different contexts.
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300 font-medium">
                    Time-saving
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Allows for quick tip calculation, enabling you to split the total and move on with your dining experience.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Calculating a Tip
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            How Much to Tip: General Guidelines
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Determining how much to tip often depends on the quality of service received and local tipping customs, which may be perceived as rude if not followed, especially when you leave a 20% tip for excellent service. <strong className="font-semibold text-gray-900 dark:text-white">The standard gratuity range typically falls between 15% and 20%, which is a percentage of your bill, ensuring fair compensation for service workers and encouraging you to thank your server by leaving a 20 percent tip.</strong> A tip is typically calculated as a percentage of the pre-tax bill amount for satisfactory service in restaurants and bars. For exceptional service, you might want to tip more, while subpar service may warrant a lower tip percentage. Many people use a tip calculator to determine the appropriate tip amount, especially when they want to leave a specific tip percentage or calculate the tip accurately.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Calculating the Tip Percentage
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            To calculate the tip percentage, you divide the tip amount you wish to leave by the bill amount and then multiply by 100, so you know exactly how much to tip for great service, which could be to leave a 20 percent gratuity for excellent service. For instance, if you want to leave a $15 tip on a $100 restaurant bill, the tip percentage would be 15%. Most free tip calculators allow you to input your desired tip percentage, and they will automatically calculate the tip you want to leave based on the total bill × your input. This method ensures you pay exactly how much you want to tip for excellent service without mental estimation errors, making it easier to calculate tips on pre-tax amounts.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Using a Gratuity Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Using a gratuity calculator simplifies the entire tipping process by allowing you to quickly find 10 percent of your total bill. You simply input the bill amount and your desired tip percentage, and the calculator does the rest, allowing you to find the total with ease. It will quickly calculate the tip amount, add it to the pre-tax subtotal, and display the total amount. Some advanced gratuity calculators also allow you to add sales tax or split the bill among multiple diners, making it an all-in-one solution for managing restaurant tips.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Quickly Calculate Tips Without a Calculator
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Simple Tricks for Mental Math
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Even without a tip calculator, you can quickly calculate a tip using simple mental math tricks, such as multiplying the bill by the chosen tip percentage or using a sales tax calculator. For example, to estimate a 20% tip, you can <strong className="font-semibold text-gray-900 dark:text-white">find 10% of the bill amount by moving the decimal one place to the left, and then multiply that number by two.</strong> If your restaurant bill is $60, 10% is $6, so a 20% tip would be $12, reflecting a common practice in tipping service workers at restaurants and cafes. This method allows you to quickly calculate the tip amount for common tip percentages, ensuring you don&apos;t need to decide how much to leave, such as half of 10 percent.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Estimating Tips on the Go
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Estimating tips on the go is essential when you don&apos;t have access to a tip calculator, especially if you need to tip quickly and want to leave a 20 percent gratuity. A common strategy is to round the bill amount to the nearest convenient number, which can help you find 10 percent quickly. For example, if your bill is $47, you might round it up to $50. Then, for a 20% tip, you can easily calculate 10% ($5) and double it ($10) to get your estimated total tip. This allows you to quickly calculate a tip without the need for a precise gratuity calculator, making it easier to split the check if needed.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Common Scenarios for Quick Calculations
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            There are many common scenarios, such as dining out with friends or going to a restaurant or bar, where quickly calculating tips without a calculator comes in handy. Dining out with friends, getting a haircut, or using a ride-sharing service are all instances where a fast mental tip calculation is useful, especially when considering the level of service and any changes in cafes. Knowing how to calculate tip percentages like 15% or 20% of the bill amount by moving the decimal can save time and prevent awkward delays while leaving a tip. For example, to find 15%, calculate 10% and then add half of that amount.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Splitting the Bill
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            How to Split the Bill Evenly
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Splitting the bill evenly among friends or colleagues is a common practice, especially when dining out and using the tip calculator for accuracy. To effectively split the bill, you first need to determine the total amount, which includes the bill amount and the tip amount.
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A tip calculator often provides a feature to split the check among a specified number of people, making it easier for friends dining at a restaurant or bar to calculate the total amount, including any service charge included. This ensures everyone contributes equally to the total bill and the gratuity. Here&apos;s how it generally works: you input your bill amount, select the tip percentage, and the calculator provides the tip and then adds it to your total.
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full border-collapse my-6 text-left">
              <tbody>
                <tr>
                  <td className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    <strong>Input</strong>
                  </td>
                  <td className="bg-gray-50 dark:bg-slate-800 border-b-2 border-gray-200 dark:border-slate-700 p-3 font-semibold text-gray-900 dark:text-gray-100">
                    <strong>Output</strong>
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Total amount and number of diners, which can help in calculating how much to tip, especially if you decide to leave a 20 percent tip for good service.
                  </td>
                  <td className="border-b border-gray-100 dark:border-slate-800 p-3 text-gray-600 dark:text-gray-300">
                    Amount to tip and pay per person (divided equally), calculated based on the total bill × the desired tip percentage.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Considering Different Services in Tipping
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            When splitting the bill, it&apos;s important to consider that different services might warrant different tip percentages or even separate tips, especially when using the tip calculator. For instance, if you received exceptional service from one particular waiter but shared a meal with someone who only had a drink, the tip amount may be adjusted based on the level of service provided, ensuring you thank your server appropriately. Some people prefer to individually calculate a tip based on their personal service charge rather than a flat tip percentage across the entire restaurant bill, which may vary in different situations. A versatile tip calculator can help navigate these nuances, allowing you to customize how much to tip for each service, including deciding to leave a 20 percent gratuity.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Using a Bill Split Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">The bill split calculator, often integrated into a free tip calculator, makes the process of dividing the total amount straightforward, allowing for easy split bills.</strong> After you calculate the tip and add it to the bill amount to get the total bill, you can then use the calculator to split it. You just enter the total amount and the number of people, and it will quickly calculate the amount each person owes, including their share of the tip. This is particularly useful when you want to leave a generous gratuity and ensure everyone contributes fairly, simplifying the process of leaving a tip.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Frequently Asked Questions
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Common Questions About Tipping
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Many common questions arise about tipping, such as &quot;How much to tip?&quot; or &quot;Should I add tax before calculating the tip, or should I find 10 percent of the total before tax?&quot;. Generally, the method of calculating tips may vary in different cultures and situations. <strong className="font-semibold text-gray-900 dark:text-white">A tip is calculated on the pre-tax bill amount, and a standard tip percentage may range from 15% to 20% for excellent service in restaurants and bars, where you may need to decide how much to tip.</strong> A tip calculator can quickly answer these questions by allowing you to experiment with different tip percentages, showing you the resulting tip amount and total amount, and helping you leave the change. It takes the guesswork out of how much you want to tip, ensuring that you can easily calculate the percentage of the bill that reflects the level of service received, especially in full-service restaurants.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Understanding Gratuity in Different Cultures
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Tipping customs vary significantly across different cultures, and understanding these differences is crucial to avoid misunderstandings, particularly regarding the obligatory minimum tip and how much you need to tip. In some countries, a service charge is automatically included in the bill, meaning no additional tip is expected, but it often raises questions about the optional tax on top of the bill. In others, a small tip is customary, while in some, leaving a tip or gratuity can even be considered offensive. Before you calculate a tip, especially when traveling, it&apos;s wise to research local tipping customs to find 10 percent of the bill as a guideline. A tip calculator can still be useful for personal budgeting, but knowing the tip you want to leave and how much to tip, such as leaving a 20 percent tip, is key.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Tipping in Japan: What You Need to Know
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            In Japan, tipping is not expected, and service staff are compensated through their wages. <strong className="font-semibold text-gray-900 dark:text-white">In some cultures, tipping may not be part of the culture and can even be considered rude or confusing, especially in restaurants and bars.</strong> Service staff in Japan are typically paid a fair wage, and exceptional service is expected as part of their job, so tipping is not expected and you should not calculate a tip. Therefore, when dining out or using services in Japan, you should not calculate a tip or use a tip calculator to determine a tip amount, as tipping is not expected and no extra tip is added to your bill. Your total bill will simply be the bill amount, with no extra tip expected from the customer, unless you choose to leave a bigger tip.
          </p>
        </article>
      </section>
    </>
  );
};
