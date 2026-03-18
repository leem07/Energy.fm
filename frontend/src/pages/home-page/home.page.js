import IconLabelTabs from "../../components/MenuTab/menu.tab";
import DemoRadar from "../../components/Radar/radar.tsx";
import ProfileCard from "../../components/ProfileCard/profile.card.tsx";
import HeartBeatBox from "../../components/HeartbeatBox/HeartBeat.tsx";
import EnergyBox from "../../components/EnergyBox/energy.box.tsx";
import { useSpotifyProfile } from "../../hooks/useSpotifyProfile.js";
import SelectBasic from "../../components/SelectActivity/select.tsx";


function HomePage() {
const profile = useSpotifyProfile();
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
                <HeartBeatBox />
                <EnergyBox />
            </div>
            <div className="w-full px-4 pt-8 flex justify-center">
                <SelectBasic />

            </div>
            <div className="fixed bottom-20 flex flex-col items-center w-full">
                <IconLabelTabs />
            </div>
        </div>
    );
}

export default HomePage;