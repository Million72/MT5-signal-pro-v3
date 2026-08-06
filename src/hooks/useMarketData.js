import { useState, useEffect, useRef } from 'react';
import { connectDeriv, subscribeCandles } from '../services/deriv';
import { SYNTHETIC_MARKETS } from '../config/synthetic';

export function useMarketData() {
  const [marketData, setMarketData] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const dataRef = useRef({});

  useEffect(() => {
    connectDeriv();
    setIsConnected(true);

    SYNTHETIC_MARKETS.forEach(market => {
      const callback = (candles) => {
        const formatted = candles.map(c => ({
          time: c.epoch,
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
        }));

        dataRef.current = {
          ...dataRef.current,
          [market.symbol]: { candles: formatted },
        };

        setMarketData({ ...dataRef.current });
      };

      subscribeCandles(market.symbol, callback);
    });

    return () => {};
  }, []);

  return { marketData, isConnected };
}
