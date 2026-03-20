import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

const activities = [
  { value: 'sleeping', label: 'Sleeping', score: 0.0 },
  { value: 'resting', label: 'Resting / Relaxing', score: 0.1 },
  { value: 'studying', label: 'Studying / Working', score: 0.2 },
  { value: 'walking', label: 'Walking', score: 0.4 },
  { value: 'light_activity', label: 'Light Activity (Yoga, Stretching)', score: 0.5 },
  { value: 'moderate_activity', label: 'Moderate Activity (Hiking, Cycling)', score: 0.7 },
  { value: 'intense_activity', label: 'Intense Activity (Running, Sports)', score: 0.9 },
];

export default function SelectBasic({ onActivityChange }) {
  const saved = localStorage.getItem('selected_activity');
  const defaultValue = saved ? JSON.parse(saved).value : 'resting';

  return (
    <Select
      listboxPlacement="bottom"
      defaultValue={defaultValue}
      onChange={(e, value) => {
        const activity = activities.find(a => a.value === value);
        if (activity && onActivityChange) onActivityChange(activity);
      }}
      sx={{
        width: 200,
        backgroundColor: '#1E293B',
        color: 'white',
        '&:hover': { backgroundColor: '#334156' },
        '& svg': { color: 'white' },
      }}
    >
      {activities.map((a) => (
        <Option key={a.value} value={a.value}>
          {a.label}
        </Option>
      ))}
    </Select>
  );
}