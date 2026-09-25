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

      {/* Optimized Educational & SEO Content for Percentage Calculator */}
      <section className="seo-content w-full max-w-4xl mx-auto mt-12 mb-16" aria-labelledby="percentage-guide-title">
        <article className="seo-article bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-10 font-sans">
          <h1
            id="percentage-guide-title"
            className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 tracking-tight"
          >
            Percentage Calculator – Calculate Percent Online Quickly and Free
          </h1>

          <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <img
              src="https://neuroncdn.com/cdn-0001/38acacb6bf8dad58dffa91343c5ac8975181c9a99486705dd169d46a48b1d93f?ts=1790322308"
              alt="A hand taps numbers on a smartphone screen showing a percent sign and a result."
              className="w-full h-auto object-cover max-h-[460px]"
              loading="lazy"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Understanding and calculating percentages is a fundamental skill that permeates various aspects of our daily lives, from finance to statistics, and even simple grocery shopping. <strong className="font-semibold text-gray-900 dark:text-white">A reliable percentage calculator can demystify these calculations, providing quick and accurate results while helping you understand the numerator and denominator in decimal form, which can be divided by 100.</strong> This article explores the utility of free online percentage calculators, guiding you through their functionalities and demonstrating how they can simplify complex percentage computations using percentage values.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Introduction to Percentage Calculators
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            What is a Percentage Calculator?
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A percentage calculator is an invaluable digital tool designed to help you calculate a percentage with ease and precision, allowing you to learn how to calculate various scenarios involving percentages. Essentially, it automates various computations, making complex manual calculations straightforward and allowing you to calculate a percentage quickly using the formula to calculate.
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            With this tool, you can effortlessly perform tasks such as converting percent to fraction or calculating a percentage.
          </p>

          <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300 space-y-2">
            <li>Determining a percentage of a number is essential for understanding how it represents a part of a whole, particularly as a factor of 100.</li>
            <li>Finding the percentage value representing a fraction of 100 can help in understanding the denominator and numerator relationships.</li>
            <li>Calculating the percentage change between two values can be simplified using a fraction to percent calculator, which helps in understanding the implications of absolute values.</li>
            <li>Converting percent to decimal is essential for understanding the formula to calculate values accurately, especially when used to express different quantities.</li>
          </ul>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Importance of Calculating Percentages
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            The ability to calculate percentages, often expressed as &quot;50 out of 100,&quot; is crucial across numerous domains, from financial planning and academic studies to everyday consumer decisions. Knowing how to find a percentage helps you understand:
          </p>

          <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300 space-y-2">
            <li>Discounts</li>
            <li>Interest rates are often expressed as a given percent, which influences various financial calculations involving adding or subtracting percentages.</li>
            <li>Statistical data can be represented in decimal form to better illustrate the relationship between values.</li>
          </ul>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            A percentage calculator simplifies the task of determining the percentage increase or decrease, allowing for quick analysis of financial growth, price changes, or even performance metrics by finding the percentage difference between two values.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Overview of Free Percentage Calculators
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            In today’s digital age, numerous free percentage calculator tools are readily available online, making percentage calculations accessible to everyone. These online percentage calculators are designed to handle a wide array of percentage calculations, including calculating a percentage of the total.
          </p>

          <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300 space-y-2">
            <li>Finding the percentage of a number is a way of expressing that number as a fraction of the total, which can also be converted into decimal form for clarity.</li>
            <li>Calculating the percentage increase and decrease is essential when you want to denote changes in data over time.</li>
          </ul>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Many free percentage calculator options also integrate functionalities like a fraction calculator or the ability to convert a percent to a fraction, streamlining various mathematical tasks and enhancing your ability to learn how to calculate effectively.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            How to Use a Percentage Calculator
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Steps to Calculate Percent
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">Using a percentage calculator to calculate a percentage is straightforward and efficient, especially when you need to add a percent sign to your results and ensure your answer is accurate to two decimal places.</strong> To find the percentage of a number, you typically input the base number and the given percent value you wish to calculate. For instance, if you need to determine 15 percent of 200, you would enter 200 as the total and 15 as the percentage. The calculator then performs the necessary operations, often involving multiplication, to give you the precise result, helping you to find a percentage with ease.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Understanding the Percent Sign
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">The “percent sign” (%) is a crucial symbol in mathematics that indicates a fraction of 100.</strong> When you see 25%, it means 25 out of every 100. A percentage calculator understands this notation, allowing you to input values directly with the percent sign or as a decimal to calculate a percentage easily. For example, to convert a percentage to a decimal, 25% becomes 0.25, which is a way of expressing the percentage as a fraction or decimal. Understanding the percent symbol is fundamental when determining the percentage or working with a fraction of 100.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Examples of Calculating Percentage
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Let&apos;s consider some practical examples of using a percentage calculator to calculate a percentage. <strong className="font-semibold text-gray-900 dark:text-white">To calculate the percentage increase or decrease, you would input the original value and the new value.</strong> The calculator then computes the percentage change from the initial value. If you want to find the percentage difference between two values, say the price of an item before and after a sale, the percentage calculator simplifies this task by quickly showing the percentage reduction. These percentage calculations are made effortless with an online percentage calculator.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Key Percentage Formulas
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Percentage of a Number
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">Calculating the percentage of a number is a fundamental operation in various fields, often involving percentages in practical applications.</strong> The basic percentage formula involves multiplying the number by the percentage value expressed as a decimal or a fraction. For example, to find 20 percent of 150, you would multiply 150 by 0.20 (20/100), illustrating the relationship between decimal to a percentage and how it relates to part of a whole. A percentage calculator automates this by letting you input the base number and the percentage, then providing the exact result, helping you to find a percentage effortlessly as a dimensionless value.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Percentage Change and Percentage Difference
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">Understanding percentage change and percentage difference is crucial for analyzing growth, decline, or comparisons between two values as a way of expressing their relationship.</strong> To calculate the percentage change, you subtract the original value from the new value, divide by the original value, and multiply the decimal by 100. Similarly, the percentage difference between two numbers is found by taking the absolute value of the difference, dividing by the average of the two numbers, and multiplying by 100 to denote the change in percent. A percentage calculator simplifies these calculations by allowing you to input the two values and instantly determining the percentage increase or decrease, or the difference between the two numbers as a fraction.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Converting Percentage to Decimal
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">Converting a percentage to a decimal is a simple yet vital step in many percentage calculations, particularly when working with percentages and decimals.</strong> The &quot;percent sign&quot; (%) literally means &quot;per hundred,&quot; so to convert a percentage to a decimal, you simply divide the percentage value by 100, effectively moving the decimal two digits to the left. For instance, 75% becomes 0.75. A percentage calculator often performs this conversion internally, but understanding this process is essential for manual calculations, especially when you need to multiply a number by a percentage or get a percentage. This also helps in understanding a fraction of 100 as a percentage of the total.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-100 tracking-tight">
            Related Calculators and Tools
          </h2>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Percentage Difference Calculator
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">A percentage difference calculator is a specialized online percentage calculator designed to quickly determine the percentage difference between two values.</strong> This tool is incredibly useful for comparing two numbers, whether it&apos;s sales figures, test scores, or financial data. By inputting the two values, the calculator automatically applies the percentage formula, calculates the absolute difference between the two, divides by the average, and provides the percentage difference, making complex comparisons straightforward and accurate.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Calculators for Finding Percentage of a Whole
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            <strong className="font-semibold text-gray-900 dark:text-white">There are numerous calculators available that specifically focus on finding the percent of x, also known as calculating the percentage of a whole, using the factor of 100.</strong> These tools are often integrated into general percentage calculators but can also be standalone to help users get a percentage quickly. They streamline the process of determining a specific portion of a total, such as calculating discounts, taxes, or a certain proportion in statistics, all of which can be expressed as a given percent or converted to decimal to a percentage. Simply input the total and the desired percentage, and the calculator will instantly find the percentage value.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200">
            Other Useful Percentage Calculators
          </h3>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            Beyond basic percentage calculations, understanding how to convert values into decimal form can enhance your analytical skills and help you express a number in different formats, including fractions and percentages. <strong className="font-semibold text-gray-900 dark:text-white">Various other useful percentage calculator tools exist to address specific needs, including those for adding or subtracting percentages, and each percentage calculator is a tool designed to simplify these calculations.</strong> These include percentage increase and decrease calculators, which show the exact percentage change between two numbers, and fraction calculator tools that can convert a percent to a fraction or a fraction to a percentage. Some advanced calculators even handle multiple percentage calculations simultaneously, providing a comprehensive solution for all your percentage needs, making them invaluable for both personal and professional use.
          </p>
        </article>
      </section>
    </>
  );
};
