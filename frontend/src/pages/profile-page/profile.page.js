import { useEffect, useState } from 'react';
import IconLabelTabs from "../../components/MenuTab/menu.tab";
import ProfileCard from "../../components/ProfileCard/profile.card.tsx";
import { useSpotifyProfile } from "../../hooks/useSpotifyProfile.js";

function ProfilePage() {
    const profile = useSpotifyProfile();

    return (
        <div className="min-h-screen bg-[#0C1D1F] text-white flex flex-col items-center justify-center px-4">
            <h2 className="text-center text-2xl font-semibold mb-4">Profile</h2>

        <ProfileCard
            username={profile?.id ?? "..."}
            displayName={profile?.display_name ?? "..."}
            imageUrl={profile?.images?.[0]?.url}
        />

            <div className="fixed bottom-20 flex flex-col items-center w-full">
                <IconLabelTabs activeTab={2} />
            </div>
        </div>
    );
}

export default ProfilePage;