"use client";

import React, { useState, useEffect, useCallback } from "react";

interface CountdownProps {
  targetDate: string; // ISO format or valid date string, e.g. "2026-08-10T08:00:00Z"
}

export function Countdown({ targetDate }: CountdownProps) {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      isLastDay: false,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
        isLastDay: difference <= 1000 * 60 * 60 * 24, // Less than 24 hours left
      };
    }

    return timeLeft;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-accent/15 border border-brand-accent/30 text-brand-accent font-sans font-semibold tracking-wide text-sm animate-pulse">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
        HAPPENING NOW
      </div>
    );
  }

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINUTES", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-foreground-muted">
        UNTIL WE GATHER AGAIN
      </span>
      <div className="flex items-center gap-3 md:gap-4">
        {units.map((unit, idx) => {
          // If less than 24 hours, apply the Flame/Orange styling, otherwise Gold/Primary
          const valueColorClass = timeLeft.isLastDay 
            ? "text-brand-accent" 
            : "text-primary";
          
          return (
            <React.Fragment key={unit.label}>
              {idx > 0 && (
                <span className="font-mono text-xl font-bold opacity-30 text-foreground">
                  :
                </span>
              )}
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background-alt border border-border shadow-xs md:h-18 md:w-18">
                  <span className={`font-mono text-xl font-bold tracking-tight md:text-2xl ${valueColorClass}`}>
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="mt-1 font-sans text-[9px] font-medium tracking-wider text-foreground-muted md:text-[10px]">
                  {unit.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
