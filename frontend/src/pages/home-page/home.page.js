import { useState, useEffect } from 'react';
import IconLabelTabs from "../../components/MenuTab/menu.tab";
import ProfileCard from "../../components/ProfileCard/profile.card.tsx";
import HeartBeatBox from "../../components/HeartbeatBox/HeartBeat.tsx";
import EnergyBox from "../../components/EnergyBox/energy.box.tsx";
import { useSpotifyProfile } from "../../hooks/useSpotifyProfile.js";
import SelectBasic from "../../components/SelectActivity/select.tsx";
import { useEnergyScore } from "../../hooks/useEnergyScore.js";

function HomePage() {
  const profile = useSpotifyProfile();

  const [selectedActivity, setSelectedActivity] = useState(() => {
    const saved = localStorage.getItem('selected_activity');
    return saved ? JSON.parse(saved) : { value: 'resting', score: 0.1 };
  });

  const [currentHR, setCurrentHR] = useState(72);

  const { energyScore, context, weights } = useEnergyScore(currentHR, selectedActivity.score);

  // save activity to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selected_activity', JSON.stringify(selectedActivity));
  }, [selectedActivity]);

  // save context and weights to localStorage when they change
  useEffect(() => {
    localStorage.setItem('energy_weights', JSON.stringify(weights));
    localStorage.setItem('energy_context', context);
    console.log('saving context:', context, 'weights:', weights);
  }, [context, weights]);

  return (
    <div className="min-h-screen bg-[#0C1D1F] text-white flex flex-col items-center justify-start pt-16">
      <div className="w-full px-4">
        <ProfileCard
          username={profile?.id ?? "..."}
          displayName={profile?.display_name ?? "..."}
          imageUrl={profile?.images?.[0]?.url}
        />
      </div>
      <div className="w-full flex items-center justify-center px-4 pt-8 gap-4">
        <HeartBeatBox onBpmChange={setCurrentHR} />
        <EnergyBox energyScore={energyScore} context={context} />
      </div>
      <div className="w-full px-4 pt-8 flex gap-6 justify-center items-center">
        <p>Current Activity:</p>
        <SelectBasic onActivityChange={setSelectedActivity} />
      </div>
      <div className="fixed bottom-20 flex flex-col items-center w-full">
        <IconLabelTabs />
      </div>
    </div>
  );
}

export default HomePage;