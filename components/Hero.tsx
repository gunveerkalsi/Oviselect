import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight } from 'lucide-react';

const colleges = [
  'NIT Trichy', 'BITS Pilani', 'IIT Bombay', 'IIIT Hyderabad',
  'NIT Warangal', 'DTU Delhi', 'NIT Surathkal', 'Thapar University',
  'NIT Calicut', 'VIT Vellore', 'NIT Rourkela', 'COEP Pune',
  'RVCE Bangalore', 'Jadavpur University', 'BIT Mesra', 'NSIT Delhi',
];

const CollegeTicker: React.FC = () => {
  const all = [...colleges, ...colleges];
  return (
    <div className="overflow-hidden border-y border-gray-100 dark:border-white/5 py-3.5 mt-12">
      <div className="marquee-track flex whitespace-nowrap">
        {all.map((c, i) => (
          <span key={i} className="flex-shrink-0 flex items-center">
            <span className="text-sm text-gray-400 dark:text-gray-600 mx-5">{c}</span>
            <span className="text-gray-200 dark:text-gray-800 text-xs">+</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const colleges_pred = [
  { name: 'NIT Trichy', branch: 'CSE', prob: 87, high: true },
  { name: 'IIIT Hyderabad', branch: 'CLD', prob: 64, high: true },
  { name: 'NIT Warangal', branch: 'CSE', prob: 58, high: false },
];

const MockCard: React.FC = () => {
  const [animated, setAnimated] = useState(false);
  const [tipVisible, setTipVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimated(true), 700);
    const t2 = setTimeout(() => setTipVisible(true), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/8 shadow-2xl dark:shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-[10px] font-medium tracking-widest uppercase mb-0.5">OviSelect AI</p>
          <p className="text-white font-semibold text-sm font-display">Rank Analysis</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 text-[11px]">JoSAA 2025</span>
        </div>
      </div>

      {/* Rank */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/5">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Your Rank</p>
        <div className="flex items-end justify-between">
          <p className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight">45,231</p>
          <div className="flex gap-2 mb-1">
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">General</span>
            <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs rounded-full">AIQ</span>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="px-5 py-4 space-y-3.5">
        {colleges_pred.map((c, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.name}</span>
                <span className="text-[11px] text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded">{c.branch}</span>
              </div>
              <span className={`text-sm font-bold ${c.high ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>{c.prob}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${c.high ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
                style={{ width: animated ? `${c.prob}%` : '0%', transitionDelay: `${i * 200}ms` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Copilot tip */}
      <div className={`transition-all duration-700 ${tipVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="mx-5 mb-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 flex gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={11} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-0.5">Copilot · Round 3</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 leading-snug">Float recommended. NIT Trichy upgrade is <strong>34%</strong> in Round 4.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 sm:pt-32 md:pt-40 pb-0 overflow-hidden bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pb-16 sm:pb-20 md:pb-24">

          {/* Left */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 rounded-full mb-7">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">JoSAA 2025 Counselling</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 dark:text-white leading-[1.04] tracking-tight mb-5">
              Stop Guessing.<br />
              <span className="text-blue-600 dark:text-blue-400">Start Choosing.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-md">
              OviSelect is your AI counselling OS. Enter your rank, get personalized college predictions, an optimized choice list, and live guidance through every counselling round.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:-translate-y-px shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 w-full sm:w-auto">
                Join the Waitlist <ArrowRight size={16} />
              </button>
              <button className="flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 w-full sm:w-auto">
                View Demo
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-3xl blur-3xl -z-10" />
            <MockCard />
          </div>
        </div>
      </div>

      {/* Ticker runs full width */}
      <CollegeTicker />

      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 dark:bg-blue-950/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10 pointer-events-none" />
    </section>
  );
};

export default Hero;