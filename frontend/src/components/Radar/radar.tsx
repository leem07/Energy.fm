import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { RadarChart } from '@mui/x-charts/RadarChart';

export default function DemoRadar() {
  const theme = useTheme();

  const stripeColorFunction =
    theme.palette.mode === 'light'
      ? (index: number) =>
          index % 2 === 0
            ? theme.palette.primary.light
            : theme.palette.grey[300]
      : (index : number) =>
          index % 2 === 0
            ? theme.palette.primary.light
            : theme.palette.grey[800];

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <RadarChart
        height={250}
        margin={{ top: 20 }}
        series={[{ data: [100, 98, 86] }]}
        divisions={10}
        stripeColor={stripeColorFunction}
        shape="circular"
        radar={{
          max: 100,
          startAngle: 30,
          metrics: [
            'Sleep',
            'Stress',
            'Heart Rate'

          ],
        }}
      />
    </Box>
  );
}