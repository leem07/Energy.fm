export function useEnergyScore(currentHR, activityScore) {
  const answers = JSON.parse(localStorage.getItem('onboarding_answers') || '{}');

  const restingHRMap = {
    'Less than 60 bpm': 55,
    '60-70 bpm': 65,
    '70-80 bpm': 75,
    'More than 80 bpm': 85,
  };

  const sleepScoreMap = {
    'Less than 5 hours': 0.1,
    '5-6 hours': 0.4,
    '7-8 hours': 0.8,
    'More than 8 hours': 0.6,
  };

  const activityScoreMap = {
    'Not at all active': 0.1,
    'Slightly active': 0.35,
    'Moderately active': 0.65,
    'Very active': 0.9,
  };

  const sedentaryScoreMap = {
    'Very sedentary': 0.1,
    'Slightly sedentary': 0.35,
    'Moderately sedentary': 0.65,
    'Not sedentary': 0.9,
  };

  const restingHR = restingHRMap[answers[1]] ?? 65;
  const maxHR = 195;

  const sleepScore = sleepScoreMap[answers[2]] ?? 0.5;
  const baselineActivity = activityScoreMap[answers[3]] ?? 0.5;
  const sedentaryScore = sedentaryScoreMap[answers[4]] ?? 0.5;

  // 1. HR normalization — use a tighter range so normal BPMs feel meaningful
  // instead of 65-195, use restingHR to restingHR+60 as the "active" zone
  // this makes 72 BPM feel like moderate energy, not near-zero
  const activeZoneMax = restingHR + 60;
  let HR = (currentHR - restingHR) / (activeZoneMax - restingHR);
  HR = Math.max(0, Math.min(1, HR));

  // 2. baseline — long term energy capacity
  const baseline = (sleepScore + baselineActivity + sedentaryScore) / 3;

  // 3. activity intent — what the user says they're doing
  const activity = Math.max(0, Math.min(1, activityScore));

  // 4. energy = HR + baseline + activity boost
  // HR drives most of it, baseline sets the floor, activity boosts it
  let energy = (0.5 * HR) + (0.3 * baseline) + (0.2 * activity);
  energy = Math.max(0, Math.min(1, energy));

  // 5. convert to 1-10
  let energyScore = Math.round(energy * 9) + 1;

  // 6. context — derived from HR vs activity mismatch + energy level
  let context = 'normal';

  if (energyScore <= 3 && activity < 0.3) {
    context = 'tired'; 
  } else if (HR > 0.4 && activity < 0.25) {
    context = 'stressed';
  } else if (energyScore >= 7 && activity >= 0.4) {
    context = 'active'; 
  }

  // 7. song weights
  const weights = {
    active:   { wh: 0.8, wc: 0.2 },
    stressed: { wh: 0.2, wc: 0.8 },
    normal:   { wh: 0.5, wc: 0.5 },
    tired:    { wh: 0.3, wc: 0.7 },
  };

  localStorage.setItem('energy_weights', JSON.stringify(weights[context]));
  localStorage.setItem('energy_context', context);

  return {
    energy,
    energyScore,
    context,
    weights: weights[context],
  };
}