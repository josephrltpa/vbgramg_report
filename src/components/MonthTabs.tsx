import { useRef, useEffect } from 'react';
import { MONTHS } from '../types';

interface MonthTabsProps {
  selectedMonth: number;
  onSelect: (month: number) => void;
}

export default function MonthTabs({ selectedMonth, onSelect }: MonthTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeRef.current;
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedMonth]);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 scrollbar-hide snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {MONTHS.map((m) => (
        <button
          key={m.index}
          ref={m.index === selectedMonth ? activeRef : null}
          onClick={() => onSelect(m.index)}
          className={`
            shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
            min-h-[44px] min-w-[60px] snap-start
            ${selectedMonth === m.index
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 active:scale-95'
            }
          `}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
