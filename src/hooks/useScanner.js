import { useState, useEffect, useRef, useCallback } from 'react';
import { scanAllIndices } from '../engine/multiIndexScanner';

export function useScanner(marketData) {
  const [signals, setSignals] = useState([]);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(null);
  const todayRef = useRef(new Date().toDateString());

  useEffect(() => {
    todayRef.current = new Date().toDateString();
  }, []);

  useEffect(() => {
    if (!marketData || Object.keys(marketData).length === 0) return;

    const scan = () => {
      const newSignals = scanAllIndices(marketData);

      if (newSignals.length > 0) {
        setSignals(prev => {
          // Reset if new day
          if (new Date().toDateString() !== todayRef.current) {
            todayRef.current = new Date().toDateString();
            return newSignals;
          }

          const existingIds = new Set(prev.map(s => s.id));
          const uniqueNew = newSignals.filter(s => !existingIds.has(s.id));
          return [...uniqueNew, ...prev].sort((a, b) => b.confidence - a.confidence);
        });
      }

      setScanCount(c => c + 1);
      setLastScanTime(Date.now());
    };

    // Scan on market data change
    scan();

    // Also scan every 5 seconds
    const interval = setInterval(scan, 5000);
    return () => clearInterval(interval);
  }, [marketData]);

  const primarySignal = signals.find(s => s.priority === 'PRIMARY') || null;
  const secondarySignal = signals.find(s => s.priority === 'SECONDARY') || null;
  const signalsToday = signals.filter(s => {
    const signalDate = new Date(s.timestamp).toDateString();
    return signalDate === todayRef.current;
  });

  return {
    primarySignal,
    secondarySignal,
    signalsToday,
    allSignals: signals,
    scanCount,
    lastScanTime,
    isScanning: true,
  };
    }
