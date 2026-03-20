import { useState, useEffect } from 'react';
import heart from '../../assets/heart.svg';

const heartbeatStyle = `
  @keyframes heartbeat {
    0%   { transform: scale(1); }
    14%  { transform: scale(1.2); }
    28%  { transform: scale(1); }
    42%  { transform: scale(1.15); }
    70%  { transform: scale(1); }
    100% { transform: scale(1); }
  }
  .heartbeat {
    animation: heartbeat 5s ease-in-out infinite;
  }
`;

export default function HeartBeatBox({ onBpmChange }: { onBpmChange?: (bpm: number) => void }) {
  const [bpm, setBpm] = useState(72);
  const [time, setTime] = useState('--:--');
  const [spinning, setSpinning] = useState(false);

  const fetchHeartRate = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8888/heart-rate');
      const data = await res.json();
      if (data.bpm) {
        setBpm(data.bpm);
        setTime(data.time);
        if (onBpmChange) onBpmChange(data.bpm);
      }
    } catch (err) {
      console.error('Failed to fetch heart rate:', err);
    }
  };

  // fetch on mount
  useEffect(() => {
    fetchHeartRate();
  }, []);

  // poll every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchHeartRate, 300000);
    return () => clearInterval(interval);
  }, []);

  // manual advance to next row
  const handleClick = async () => {
    setSpinning(true);
    try {
      const res = await fetch('http://127.0.0.1:8888/heart-rate/next', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.bpm) {
        setBpm(data.bpm);
        setTime(data.time);
        if (onBpmChange) onBpmChange(data.bpm);
      }
    } catch (err) {
      console.error('Failed to advance heart rate:', err);
    }
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <>
      <style>{heartbeatStyle}</style>
      <div
        onClick={handleClick}
        style={{ width: 220, height: 220 }}
        className="bg-slate-700 rounded-xl p-4 flex flex-col text-white cursor-pointer hover:bg-slate-600 transition"
      >
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <img
              src={heart}
              alt="Heart"
              width="130"
              height="120"
              className="heartbeat"
            />
            <span className="absolute text-white font-semibold text-2xl">
              {bpm}
            </span>
          </div>

          <p className="text-sm mt-2 text-slate-300">BPM</p>

          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <span
              className={`text-slate-400 text-base ${spinning ? 'animate-spin' : ''}`}
              style={{ display: 'inline-block' }}
            >
              ↻
            </span>
            <span>Last Updated: {time}</span>
          </div>
        </div>
      </div>
    </>
  );
}