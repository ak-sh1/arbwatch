interface StatusBannerProps {
  mode: 'live' | 'replay';
  lastUpdate: number;
}

export default function StatusBanner({ mode, lastUpdate }: StatusBannerProps) {
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate) / 1000);

  return (
    <div className={`mb-6 p-4 rounded-lg border ${
      mode === 'live' 
        ? 'bg-green-900/20 border-green-500/50' 
        : 'bg-blue-900/20 border-blue-500/50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            mode === 'live' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
          }`} />
          <span className="font-semibold">
            {mode === 'live' ? '🟢 LIVE MODE' : '🔵 REPLAY MODE'}
          </span>
        </div>
        <span className="text-slate-400 text-sm">
          Updated {timeSinceUpdate}s ago
        </span>
      </div>
      {mode === 'replay' && (
        <p className="mt-2 text-sm text-slate-300">
          Using simulated data. Set DATABASE_URL to enable live mode.
        </p>
      )}
    </div>
  );
}
