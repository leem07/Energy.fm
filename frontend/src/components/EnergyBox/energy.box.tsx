import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const settings = {
  width: 185,
  height: 150,
  value: 60,
};

export default function EnergyBox() {
  return (
    <div className="w-50 h-50 bg-slate-700 rounded-xl p-4 justify-center items-center flex flex-col text-white">
        
      <Gauge
        {...settings}
        cornerRadius="50%"
        sx={(theme) => ({
        [`& .${gaugeClasses.valueText}`]: {
          fontSize: 40,
         
        },
        [`& .${gaugeClasses.valueText} text`]: {
            fill: theme.palette.common.white,
        },
        [`& .${gaugeClasses.valueArc}`]: {
          fill: '#52b202',
        },
        [`& .${gaugeClasses.referenceArc}`]: {
          fill: theme.palette.text.disabled,
        },
      })}
    />
    <p className="text-lg mt-2">Energy Level</p>
    </div>
  );
}
