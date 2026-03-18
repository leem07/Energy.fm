import { useEffect, useState } from 'react';

export function useSpotifyProfile() {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('spotify_token');
        if (!token) return;

        fetch("http://127.0.0.1:8888/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => console.error("Failed to fetch profile:", err));
    }, []);

    return profile;
}