"use client";

import React, { useRef, useEffect } from "react";
import { format, startOfYear, addMonths, isSameMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MonthPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function MonthPicker({ selectedDate, onChange }: MonthPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 12 months of the current year
  const months = Array.from({ length: 12 }, (_, i) => {
    return addMonths(startOfYear(selectedDate), i);
  });

  // Scroll to selected month on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedElement = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, []);

  return (
    <div className="w-full py-4 px-2">
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
      >
        {months.map((month) => {
          const isSelected = isSameMonth(month, selectedDate);
          return (
            <button
              key={month.toISOString()}
              data-selected={isSelected}
              onClick={() => onChange(month)}
              className={cn(
                "flex-shrink-0 px-6 py-3 rounded-2xl transition-all duration-300 flex flex-col items-center min-w-[100px]",
                isSelected
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/30 scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700"
              )}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">
                {format(month, "yyyy")}
              </span>
              <span className="text-sm font-black capitalize">
                {format(month, "MMMM", { locale: vi })}
              </span>
            </button>
          );
        })}
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
