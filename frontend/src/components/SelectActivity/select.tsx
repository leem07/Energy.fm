import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

const activities = [
  { value: 'sleeping', label: 'Sleeping', score: 2 },
  { value: 'walking', label: 'Walking', score: 25 },
  { value: 'yoga', label: 'Yoga', score: 35 },
  { value: 'hiking', label: 'Hiking', score: 55 },
  { value: 'cycling', label: 'Cycling', score: 65 },
  { value: 'swimming', label: 'Swimming', score: 72 },
  { value: 'weightlifting', label: 'Weightlifting', score: 75 },
  { value: 'basketball', label: 'Basketball', score: 80 },
  { value: 'soccer', label: 'Soccer', score: 85 },
  { value: 'running', label: 'Running', score: 90 },
  { value: 'hiit', label: 'HIIT', score: 97 },
];

export default function SelectBasic() {
  return (
    <Select
      defaultValue="walking"
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
          {a.label} — {a.score}/100
        </Option>
      ))}
    </Select>
  );
}