import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

export default function EnergyBox({ energyScore = 0, context = 'normal' }) {
  return (
    <div style={{ width: 220, height: 220 }} className="bg-slate-700 rounded-xl p-4 justify-center items-center flex flex-col text-white">
      <Gauge
        width={185}
        height={150}
        value={Math.round(energyScore)}
        valueMin={0}
        valueMax={10}
        cornerRadius="50%"
        sx={(theme) => ({
          [`& .${gaugeClasses.valueText}`]: { fontSize: 40 },
          [`& .${gaugeClasses.valueText} text`]: { fill: theme.palette.common.white },
          [`& .${gaugeClasses.valueArc}`]: { fill: '#1d4ed8' },
          [`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.text.disabled },
        })}
      />
      <p className="text-lg mt-2">Energy Level</p>
      <p className="text-xs text-slate-400 capitalize">{context}</p>
    </div>
  );
}