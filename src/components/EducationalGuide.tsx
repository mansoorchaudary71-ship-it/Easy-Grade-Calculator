import React, { useState } from 'react';
import { FAQ_LIST } from '../data/constants';

export const EducationalGuide: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="seo-content" aria-labelledby="page-content-title">
      <div className="seo-content-intro">
        <div className="eyebrow">Grade guide</div>
        <h1 id="page-content-title">Easy Grade Calculator</h1>
        <p>
          Understand the math behind your result, then use the calculator above to plan your next move.
        </p>
      </div>

      <article className="seo-article">
        <h2>How to Calculate Your Grade</h2>
        <p>
          A grade percentage compares what you earned with what was available. In a points-based class, the basic formula is total points earned divided by total points possible, multiplied by 100. A weighted grade average goes one step further: it gives each assessment or category a different influence on the final result. A final exam worth 40% can change your grade more than a quiz worth 5%, even when both scores are similar.
        </p>

        <h3>What a weighted grade average means</h3>
        <p>
          A weight represents importance, not performance. Your score is how well you did; the weight is how much that score counts. To calculate a weighted average, turn each score into a percentage, multiply it by its weight, and add the contributions. Weights are usually written as percentages that add to 100%, such as 20%, 30%, and 50%. If you only know relative weights such as 2, 3, and 5, the same calculation works after dividing the total contribution by the total weight. This normalization keeps the result fair when the entries do not already total 100.
        </p>

        <h3>How to calculate your grade manually</h3>
        <ol>
          <li>
            List every assessment or category, including its earned points, possible points, and weight if your class uses weights.
          </li>
          <li>
            For Points mode, add all earned points and all possible points separately. Divide the first total by the second and multiply by 100.
          </li>
          <li>
            For Weighted mode, calculate each category percentage, convert each weight to a decimal, and multiply the two numbers.
          </li>
          <li>
            Add the weighted contributions. If the weights do not total 1.00, divide that sum by the total of the weights before converting it to a percentage.
          </li>
          <li>
            Compare the unrounded result with your school’s grading scale. Check the syllabus for dropped scores, extra credit, minimum exam rules, and the teacher’s rounding policy.
          </li>
        </ol>

        <h3>Common grading scales around the world</h3>
        <p>
          In the United States, many courses use letter grades: A commonly begins at 90%, B at 80%, C at 70%, D at 60%, and F below 60%. Plus/minus scales use narrower bands, such as A at 93% and A− at 90%, but the exact cutoffs vary. Percentage-based systems report a number from 0 to 100 and may use different pass thresholds. GPA systems convert letter grades into quality points, often on a 4.0 scale, then weight those points by course credits. CGPA systems are also common internationally and may use a 10-point scale or another institutional scale. GPA, CGPA, percentage, and letter grades are related but are not universally interchangeable, so use your institution’s official conversion table when one is required.
        </p>

        <h3>Worked examples</h3>
        <p>
          <strong>Example 1 — simple points total:</strong> You earn 18/20 on a quiz, 84/100 on a midterm, and 92/100 on a project. Add the earned points: 18 + 84 + 92 = 194. Add the possible points: 20 + 100 + 100 = 220. Then calculate <strong>194 ÷ 220 × 100 = 88.2%</strong>. Every point counts directly, so Points mode is appropriate.
        </p>
        <p>
          <strong>Example 2 — three weighted categories:</strong> Your quiz average is 90% and worth 20%, your midterm is 82% and worth 30%, and your project is 94% and worth 50%. The contributions are 90 × 0.20 = 18, 82 × 0.30 = 24.6, and 94 × 0.50 = 47. Add them to get <strong>89.6%</strong>. The project has the largest effect because it has the largest weight.
        </p>
        <p>
          <strong>Example 3 — planning around a final:</strong> Suppose current work is 86% worth 40% and a midterm is 78% worth 25%. You expect 92% on a final project worth 35%. The estimate is <strong>(86 × 0.40) + (78 × 0.25) + (92 × 0.35) = 34.4 + 19.5 + 32.2 = 86.1%</strong>. If the target is an 88%, you can use the calculator’s planning inputs to solve for the final score required instead of guessing. These examples show why entering the correct weights matters as much as entering the correct scores.
        </p>
        <p>
          Use this calculator as a planning aid, not as a replacement for your official gradebook. Confirm category weights, missing work, late penalties, extra credit, and rounding rules with your syllabus or instructor before making an academic decision.
        </p>
      </article>

      <section className="seo-howto" aria-labelledby="how-to-title">
        <div className="seo-section-heading">
          <div className="eyebrow">A quick walkthrough</div>
          <h2 id="how-to-title">How to Use This Calculator</h2>
        </div>
        <ol>
          <li>Choose Points mode when every point contributes directly to your course total.</li>
          <li>Enter each assessment’s name, earned points, and possible points.</li>
          <li>Choose Weighted mode when assessments or categories count for different percentages.</li>
          <li>Select Calculate grade to see the percentage, letter classification, and planning result.</li>
        </ol>
      </section>

      <section className="seo-about" aria-labelledby="about-tool-title">
        <div className="seo-section-heading">
          <div className="eyebrow">Built for clear decisions</div>
          <h2 id="about-tool-title">About This Tool</h2>
        </div>
        <p>
          Easy Grade Calculator is a browser-based planning tool for students, families, teachers, and anyone who needs a quick, transparent grade estimate. Calculations happen on your device, so you can test scores without creating an account or uploading a gradebook. The formulas are shown in plain language, and the guide explains when a points total, weighted average, GPA, or percentage comparison is the right method.
        </p>
        <p>
          Because grading policies differ, the calculator keeps your inputs visible and lets you choose a standard or plus/minus reference scale. Use the result to prepare a question for your instructor, check a syllabus calculation, or understand what score would make a realistic difference.
        </p>
      </section>

      <section className="seo-faq" aria-labelledby="faq-title">
        <div className="seo-section-heading">
          <div className="eyebrow">Common questions</div>
          <h2 id="faq-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {FAQ_LIST.map((item, index) => {
            const isOpen = openFaqIndex === index;
            const contentId = `faq-answer-${index}`;
            return (
              <div key={item.question} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{item.question}</span>
                    <span className="faq-toggle" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <div className="faq-answer" id={contentId}>
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};
