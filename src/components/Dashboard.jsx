import { useMarketData } from '../hooks/useMarketData';
import { useScanner } from '../hooks/useScanner';
import ScannerStatus from './ScannerStatus';
import StatsBar from './StatsBar';
import SignalCard from './SignalCard';
import SignalHistory from './SignalHistory';

export default function Dashboard() {
  const { marketData, isConnected } = useMarketData();
  const { primarySignal, secondarySignal, signalsToday, scanCount, lastScanTime } = useScanner(marketData);

  return (
    <div className="dashboard">
      <ScannerStatus
        isConnected={isConnected}
        scanCount={scanCount}
        lastScanTime={lastScanTime}
        signalsToday={signalsToday.length}
      />

      <StatsBar signals={signalsToday} />

      {primarySignal && (
        <SignalCard signal={primarySignal} isPrimary />
      )}

      {secondarySignal && (
        <SignalCard signal={secondarySignal} />
      )}

      {!primarySignal && !secondarySignal && (
        <div className="no-signals">
          <h3>🔍 Scanning Indices</h3>
          <p>V5 · V10 · V25 · V75 · V100</p>
          <p>Waiting for zero-tolerance setup...</p>
          <p style={{ fontSize: 12, marginTop: 12, color: '#666' }}>
            Signals appear when all 7 gates pass
          </p>
        </div>
      )}

      <SignalHistory signals={signalsToday} />
    </div>
  );
}
