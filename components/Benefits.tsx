import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const benefits = [
  'AI rank-to-college prediction across 50K+ combos',
  'Risk-balanced, round-aware choice list',
  'Real student insights from Reddit and LinkedIn',
  'Freeze, Float or Slide guidance every round',
  'Personalised to your goals, not just your rank',
];

const Benefits: React.FC = () => {
  return (
    <section id="about" className="py-20 sm:py-28 md:py-36 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">

        {/* Large manifesto statement */}
        <div className="max-w-4xl mb-20 md:mb-28 fade-up">
          <span className="text-xs font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-5 block">The Problem</span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.06] tracking-tight">
            16 lakh students.<br />
            <span className="text-gray-300 dark:text-gray-600">Zero personalised guidance.</span>
          </h2>
        </div>

        {/* Two column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: short explanation */}
          <div className="fade-up fade-up-d1">
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
              Every year, JEE aspirants navigate one of life's most consequential decisions using coaching PDFs, peer pressure, and half-truths online. OviSelect is the missing layer.
            </p>
            <button className="text-sm font-semibold text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-0.5 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-200">
              Learn how we're different
            </button>
          </div>

          {/* Right: checklist */}
          <div className="space-y-5">
            {benefits.map((b, i) => (
              <div key={i} className={`flex items-start gap-4 fade-up fade-up-d${i + 1}`}>
                <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200">{b}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Benefits;
