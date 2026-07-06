import { useState, useEffect } from 'react';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeConfig {
  period: TimeOfDay;
  label: string;
  bgOverlay: string;       // rgba CSS color for subtle overlay
  particleColorBoost: string; // extra tint color for particles
  particleSpeedMult: number;
  fogBoost: number;
}

export function useTimeOfDay(): TimeConfig {
  const [timeConfig, setTimeConfig] = useState<TimeConfig>(getConfigForHour(new Date().getHours()));

  useEffect(() => {
    const updateConfig = () => {
      setTimeConfig(getConfigForHour(new Date().getHours()));
    };

    const intervalId = setInterval(updateConfig, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return timeConfig;
}

function getConfigForHour(hour: number): TimeConfig {
  if (hour >= 5 && hour <= 10) {
    return {
      period: 'morning',
      label: 'Morning Light',
      bgOverlay: 'rgba(184, 212, 232, 0.08)',
      particleColorBoost: '#B8D4E8',
      particleSpeedMult: 0.8,
      fogBoost: 1.2
    };
  } else if (hour >= 11 && hour <= 16) {
    return {
      period: 'afternoon',
      label: 'Afternoon Clear',
      bgOverlay: 'rgba(216, 226, 241, 0.06)',
      particleColorBoost: '#D8E2F1',
      particleSpeedMult: 1.0,
      fogBoost: 0.8
    };
  } else if (hour >= 17 && hour <= 19) {
    return {
      period: 'evening',
      label: 'Evening Blue Hour',
      bgOverlay: 'rgba(155, 159, 196, 0.1)',
      particleColorBoost: '#9B9FC4',
      particleSpeedMult: 0.9,
      fogBoost: 1.5
    };
  } else {
    return {
      period: 'night',
      label: 'Moonlit Night',
      bgOverlay: 'rgba(27, 38, 59, 0.12)',
      particleColorBoost: '#415A77',
      particleSpeedMult: 0.6,
      fogBoost: 1.8
    };
  }
}
