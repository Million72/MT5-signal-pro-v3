import { useState, useCallback } from 'react';

export function useAccountProtection(initialBalance = 100) {
  const [balance, setBalance] = useState(initialBalance);
  const [dailyPnL, setDailyPnL] = useState(0);
  const [tradesToday, setTradesToday] = useState(0);
  const [activeTrades, setActiveTrades] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const MAX_RISK_PERCENT = 0.5;
  const MAX_TRADES = 2;
  const DAILY_LOSS_LIMIT = 2; // 2%

  const canTrade = useCallback((entry, stopLoss) => {
    if (isBlocked) return { allowed: false, reason: 'Trading blocked' };
    if (activeTrades >= MAX_TRADES) return { allowed: false, reason: 'Max active trades' };

    const riskAmount = Math.abs(entry - stopLoss);
    const riskPercent = (riskAmount / balance) * 100;
    if (riskPercent > MAX_RISK_PERCENT) {
      return { allowed: false, reason: `Risk ${riskPercent.toFixed(2)}% exceeds ${MAX_RISK_PERCENT}%` };
    }

    const dailyLossPercent = Math.abs(dailyPnL) / balance * 100;
    if (dailyLossPercent >= DAILY_LOSS_LIMIT && dailyPnL < 0) {
      setIsBlocked(true);
      return { allowed: false, reason: 'Daily loss limit reached' };
    }

    return { allowed: true, positionSize: (balance * MAX_RISK_PERCENT / 100) / riskAmount };
  }, [balance, dailyPnL, activeTrades, isBlocked]);

  const onTradeOpened = useCallback(() => {
    setActiveTrades(c => c + 1);
    setTradesToday(c => c + 1);
  }, []);

  const onTradeClosed = useCallback((pnl) => {
    setActiveTrades(c => Math.max(0, c - 1));
    setBalance(c => c + pnl);
    setDailyPnL(c => c + pnl);
  }, []);

  const resetDaily = useCallback(() => {
    setDailyPnL(0);
    setTradesToday(0);
    setIsBlocked(false);
  }, []);

  return {
    balance,
    dailyPnL,
    tradesToday,
    activeTrades,
    isBlocked,
    canTrade,
    onTradeOpened,
    onTradeClosed,
    resetDaily,
  };
}
