import { useState, useEffect } from 'react';
import { getSetting } from '../services/storage';

interface UnitSettings {
  useMetric: boolean;   // true = cm, false = inch
  useKg: boolean;       // true = kg, false = lb
  useCelsius: boolean;  // true = C, false = F
  // Formatters
  formatLength: (cm: number) => string;
  formatWeight: (kg: number) => string;
  formatTemp: (celsius: number) => string;
  lengthUnit: string;
  weightUnit: string;
  tempUnit: string;
}

export function useUnits(): UnitSettings {
  const [settings, setSettings] = useState({
    useMetric: true,
    useKg: true,
    useCelsius: true,
  });

  useEffect(() => {
    async function load() {
      const metric = await getSetting('use_metric');
      const kg = await getSetting('use_kg');
      const celsius = await getSetting('use_celsius');
      setSettings({
        useMetric: metric !== 'false',
        useKg: kg !== 'false',
        useCelsius: celsius !== 'false',
      });
    }
    load();
  }, []);

  const formatLength = (cm: number): string => {
    if (settings.useMetric) return `${cm}cm`;
    return `${(cm / 2.54).toFixed(1)}in`;
  };

  const formatWeight = (kg: number): string => {
    if (settings.useKg) return `${kg}kg`;
    return `${(kg * 2.20462).toFixed(1)}lb`;
  };

  const formatTemp = (celsius: number): string => {
    if (settings.useCelsius) return `${celsius}°C`;
    return `${(celsius * 9 / 5 + 32).toFixed(0)}°F`;
  };

  return {
    ...settings,
    formatLength,
    formatWeight,
    formatTemp,
    lengthUnit: settings.useMetric ? 'cm' : 'in',
    weightUnit: settings.useKg ? 'kg' : 'lb',
    tempUnit: settings.useCelsius ? '°C' : '°F',
  };
}
